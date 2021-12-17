import {test} from 'hoare';
import {stub} from 'sinon';
import * as getUnresolvedConfModule from './getUnresolvedConf';
import {mock} from 'cjs-mock';

test('empty case', (assert) => {

    // given
    const stubs = {
        loadConfFile: stub().returns({}),
        getConfDir: stub().returns('/conf'),
    };
    const m: typeof getUnresolvedConfModule = mock('./getUnresolvedConf', {
        './loadConfFile': {loadConfFile: stubs.loadConfFile},
        './getConfDir': {getConfDir: stubs.getConfDir},
    });

    // when
    const output = m.getUnresolvedConf();

    // then
    assert.equal(
        stubs.getConfDir.callCount,
        1,
        'getConfDir() should be called exactly once'
    );
    assert.equal(
        stubs.loadConfFile.args,
        [['/conf/default.json']],
        'loadConfFile() should be called exactly once with `/conf/default.json`'
    );
    assert.equal(output, {}, 'should return empty object');

});

test('default conf only, {foo: bar}', (assert) => {

    // given
    const stubs = {
        loadConfFile: stub().returns({foo: 'bar'}),
        getConfDir: stub().returns('/conf'),
    };
    const m: typeof getUnresolvedConfModule = mock('./getUnresolvedConf', {
        './loadConfFile': {loadConfFile: stubs.loadConfFile},
        './getConfDir': {getConfDir: stubs.getConfDir},
    });

    // when
    const output = m.getUnresolvedConf();

    // then
    assert.equal(
        stubs.getConfDir.callCount,
        1,
        'getConfDir() should be called exactly once'
    );
    assert.equal(
        stubs.loadConfFile.args,
        [['/conf/default.json']],
        'loadConfFile() should be called exactly once with `/conf/default.json`'
    );
    assert.equal(output, {
        foo: 'bar',
    }, 'should return {foo: "bar"}');

});

// eslint-disable-next-line max-lines-per-function
test('multiple confs, edge cases, etc.', (assert) => {

    // given
    const stubs = {
        loadConfFile: stub(),
        getConfDir: stub().returns('/conf'),
    };

    stubs.loadConfFile.withArgs('/conf/default.json').returns({
        foo: 'default',
        url: 'http://localhost',
        loader: {
            '[loader]': {
                param1: 'a',
                param2: 'b',
            },
        },
        bar: {
            a: 1,
            b: 2,
            c: {
                'a-name-with-hyphens': [1, 2, 3],
                b: 8,
            },
            d: true,
        },
        q: false,
    });
    stubs.loadConfFile.withArgs('/conf/environments/development.json').returns({
        foo: 'development',
        loader: {
            '[loader]': {
                param1: 'c',
            },
        },
        bar: {
            a: 1,
            b: 5,
        },
    });
    stubs.loadConfFile.withArgs('/conf/deployments/test.acme.com.json').returns({
        foo: 'test.acme.com',
        url: 'http://test.acme.com',
        bar: {
            c: {
                'a-name-with-hyphens': [5, 5, 5],
            },
            d: false,
        },
    });
    stubs.loadConfFile.withArgs('/conf/users/john.json').returns({
        foo: 'john',
    });

    const overrides = {
        q: true,
    };
    const m: typeof getUnresolvedConfModule = mock('./getUnresolvedConf', {
        './loadConfFile': {loadConfFile: stubs.loadConfFile},
        './getConfDir': {getConfDir: stubs.getConfDir},
    });

    // when
    const output = m.getUnresolvedConf(
        'development',
        'test.acme.com',
        'john',
        overrides
    );

    // then
    assert.equal(
        stubs.getConfDir.callCount,
        1,
        'getConfDir() should be called exactly once'
    );
    assert.equal(
        stubs.loadConfFile.args,
        [
            ['/conf/default.json'],
            ['/conf/environments/development.json'],
            ['/conf/deployments/test.acme.com.json'],
            ['/conf/users/john.json'],
        ],
        'loadConfFile() should be called 4 times, each with appropriate conf'
    );
    assert.equal(output, {
        foo: 'john',
        loader: {
            '[loader]': {
                param1: 'c',
            },
        },
        url: 'http://test.acme.com',
        bar: {
            a: 1,
            b: 5,
            c: {
                'a-name-with-hyphens': [5, 5, 5],
                b: 8,
            },
            d: false,
        },
        q: true,
    }, 'should return merged conf');

});
