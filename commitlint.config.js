const types = require('@commitlint/config-conventional');
module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            [
                ...types.rules['type-enum'][2],
                ...[
                    'release'
                ]
            ]
        ]
    }
};
