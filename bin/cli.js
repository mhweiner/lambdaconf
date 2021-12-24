#!/usr/bin/env node

require('../dist/writeConfFile')
    .writeConfFile()
    .catch(console.log.bind(console));
