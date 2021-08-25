#!/usr/bin/env node

require('../dist/writeDeclarationFile')
    .writeDeclarationFile()
    .catch(console.log.bind(console));
