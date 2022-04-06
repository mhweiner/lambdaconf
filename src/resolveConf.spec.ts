import {test} from 'hoare';
import {resolveConf} from './resolveConf';

test('if no loaders or environment variables present, should return same result back', async (assert) => {

    // given
    const unresolvedConfig = {foo: 'bar'};

    // when
    const output = await resolveConf(unresolvedConfig, {});

    // then
    assert.equal(output, unresolvedConfig);

});

test('should resolve environment variable', async (assert) => {

    // given
    process.env.FOO = 'bar123!';

    const unresolvedConfig = {foo: '${FOO}'};

    // when
    const output = await resolveConf(unresolvedConfig, {});

    // then
    assert.equal(output, {foo: 'bar123!'});

});

test('config with a loader should resolve', async (assert) => {

    // given
    const unresolvedConfig = {
        foo: {
            '[foo]': {
                a: '123',
            },
        },
    };
    const loaders = {foo: (arg: {
        a: string
    }): string => `foo_${arg.a}`};

    // when
    const output = await resolveConf(unresolvedConfig, loaders);

    // then
    assert.equal(output, {
        foo: 'foo_123',
    });

});
