import {isolate, stub, suite} from '@koneksahealth/ktest';
import * as getUnresolvedConfigModule from './getUnresolvedConfig';

const s = suite('getUnresolvedConfig()');

s.test('empty case', (assert) => {

    assert.plan(3);

    // given
    const stubs = {
        loadConfigFile: stub().returns({}),
        getConfigDir: stub().returns('/config'),
    };
    const m: typeof getUnresolvedConfigModule = isolate('./getUnresolvedConfig', {imports: [
        ['./loadConfigFile', {loadConfigFile: stubs.loadConfigFile}],
        ['./getConfigDir', {getConfigDir: stubs.getConfigDir}],
    ]});

    // when
    const output = m.getUnresolvedConfig();

    // then
    assert.deepEqual(
        stubs.getConfigDir.callCount,
        1,
        'getConfigDir() should be called exactly once'
    );
    assert.deepEqual(
        stubs.loadConfigFile.args,
        [['/config/default.json']],
        'loadConfigFile() should be called exactly once with `/config/default.json`'
    );
    assert.deepEqual(output, {}, 'should return empty object');

});

s.test('default config only, {foo: bar}', (assert) => {

    assert.plan(3);

    // given
    const stubs = {
        loadConfigFile: stub().returns({foo: 'bar'}),
        getConfigDir: stub().returns('/config'),
    };
    const m: typeof getUnresolvedConfigModule = isolate('./getUnresolvedConfig', {imports: [
        ['./loadConfigFile', {loadConfigFile: stubs.loadConfigFile}],
        ['./getConfigDir', {getConfigDir: stubs.getConfigDir}],
    ]});

    // when
    const output = m.getUnresolvedConfig();

    // then
    assert.deepEqual(
        stubs.getConfigDir.callCount,
        1,
        'getConfigDir() should be called exactly once'
    );
    assert.deepEqual(
        stubs.loadConfigFile.args,
        [['/config/default.json']],
        'loadConfigFile() should be called exactly once with `/config/default.json`'
    );
    assert.deepEqual(output, {
        foo: 'bar',
    }, 'should return {foo: "bar"}');

});

// eslint-disable-next-line max-lines-per-function
s.test('multiple configs, edge cases, etc.', (assert) => {

    assert.plan(3);

    // given
    const stubs = {
        loadConfigFile: stub(),
        getConfigDir: stub().returns('/config'),
    };

    stubs.loadConfigFile.withArgs('/config/default.json').returns({
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
    stubs.loadConfigFile.withArgs('/config/environments/development.json').returns({
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
    stubs.loadConfigFile.withArgs('/config/deployments/test.acme.com.json').returns({
        foo: 'test.acme.com',
        url: 'http://test.acme.com',
        bar: {
            c: {
                'a-name-with-hyphens': [5, 5, 5],
            },
            d: false,
        },
    });
    stubs.loadConfigFile.withArgs('/config/users/john.json').returns({
        foo: 'john',
    });

    const overrides = {
        q: true,
    };

    const m: typeof getUnresolvedConfigModule = isolate('./getUnresolvedConfig', {imports: [
        ['./loadConfigFile', {loadConfigFile: stubs.loadConfigFile}],
        ['./getConfigDir', {getConfigDir: stubs.getConfigDir}],
    ]});

    // when
    const output = m.getUnresolvedConfig(
        'development',
        'test.acme.com',
        'john',
        overrides
    );

    // then
    assert.deepEqual(
        stubs.getConfigDir.callCount,
        1,
        'getConfigDir() should be called exactly once'
    );
    assert.deepEqual(
        stubs.loadConfigFile.args,
        [
            ['/config/default.json'],
            ['/config/environments/development.json'],
            ['/config/deployments/test.acme.com.json'],
            ['/config/users/john.json'],
        ],
        'loadConfigFile() should be called 4 times, each with appropriate config'
    );
    assert.deepEqual(output, {
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
    }, 'should return merged config');

});

