const jiraURL = 'https://koneksa-health.atlassian.net/browse';

// Copied from https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-angular/writer-opts.js#L27
// and slightly modified to support adding all commit types to the release notes and links for Jira Tickets
const transform = (commit, context) => {
    const issues = []

    commit.notes.forEach(note => {
        note.title = 'BREAKING CHANGES'
    })

    // get changelog header
    if (commit.type === 'feat') {
        commit.type = 'Features'
    } else if (commit.type === 'fix') {
        commit.type = 'Bug Fixes'
    } else if (commit.type === 'perf') {
        commit.type = 'Performance Improvements'
    } else if (commit.type === 'revert' || commit.revert) {
        commit.type = 'Reverts'
    } else if (commit.type === 'docs') {
        commit.type = 'Documentation'
    } else if (commit.type === 'style') {
        commit.type = 'Styles'
    } else if (commit.type === 'refactor') {
        commit.type = 'Code Refactoring'
    } else if (commit.type === 'test') {
        commit.type = 'Tests'
    } else if (commit.type === 'build') {
        commit.type = 'Build System'
    } else if (commit.type === 'ci') {
        commit.type = 'Continuous Integration'
    } else {
        return false
    }

    if (commit.scope === '*') {
        commit.scope = ''
    } else if (/KH-([0-9]+)/.test(commit.scope)) {
        const tickets = commit.scope.match(/(KH-[0-9]+)/g)
        commit.scope = ''
        commit.subject = `${commit.subject} (${tickets.map((ticket) => `[${ticket}](${jiraURL}/${ticket})`).join(', ')})`
    }

    if (typeof commit.hash === 'string') {
        commit.shortHash = commit.hash.substring(0, 7)
    }

    if (typeof commit.subject === 'string') {
        let url = context.repository
            ? `${context.host}/${context.owner}/${context.repository}`
            : context.repoUrl
        if (url) {
            url = `${url}/issues/`
            // Issue URLs.
            commit.subject = commit.subject.replace(/#([0-9]+)/g, (_, issue) => {
                issues.push(issue)
                return `[#${issue}](${url}${issue})`
            })
        }
        if (context.host) {
            // User URLs.
            commit.subject = commit.subject.replace(/\B@([a-z0-9](?:-?[a-z0-9/]){0,38})/g, (_, username) => {
                if (username.includes('/')) {
                    return `@${username}`
                }

                return `[@${username}](${context.host}/${username})`
            })
        }
    }

    // remove references that already appear in the subject
    commit.references = commit.references.filter(reference => {
        if (issues.indexOf(reference.issue) === -1) {
            return true
        }

        return false
    })

    return commit
}

const parserOpts = {
    "noteKeywords": ["BREAKING-CHANGE", "BREAKING CHANGE", "BREAKING CHANGES"],
    "headerPattern": /^(\w*)(?:\(([\w\$\.\-\* ]*)\))?!?: (.*)$/,
    "breakingHeaderPattern": /^(\w*)(?:\((.*)\))?!: (.*)$/,
}

module.exports = {
    "branches": [
        "master",
        "main",
        { "name": "candidate-*", "prerelease": "rc" },
    ],
    "plugins": [
        ["@semantic-release/commit-analyzer", {
            "releaseRules": [
                { "type": "build", "release": "patch" },
                { "type": "ci", "release": "patch" },
                { "type": "refactor", "release": "patch" },
                { "type": "style", "release": "patch" }
            ],
            parserOpts,
        }],
        ["@semantic-release/release-notes-generator", {
            "writerOpts": { transform },
            parserOpts,
        }],
        "@semantic-release/github",
        '@semantic-release/npm',
    ],
};
