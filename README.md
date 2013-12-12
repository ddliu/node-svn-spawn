# svn-spawn

[![Build Status](https://travis-ci.org/ddliu/node-svn-spawn.png)](https://travis-ci.org/ddliu/node-svn-spawn)

Easy way to access svn repository with node.js.

## Features

- Easy to use
- Fast way to add local changes
- Query svn infomation as array or object
- Common svn commands are all supported

## Usage

Create a svn client instance

```js
var Client = require('svn-spawn');
var client = new Client({
    cwd: '/path to your svn working directory',
    username: 'username', // optional if authentication not required or is already saved
    password: 'password', // optional if authentication not required or is already saved
});
```
`svn update`

```js
client.update(function(err, data) {
    console.log('updated');
});
```

`svn info`

```js
client.getInfo(function(err, data) {
    console.log('Repository url is %s', data.url);
});
```

Make some changes and commit all

```js
client.addLocal(function(err, data) {
    console.log('all local changes has been added for commit');

    client.commit('commit message here', function(err, data) {
        console.log('local changes has been committed!');
    });
});
```

Single file

```js
client.add('relative/path/to/file', function(err, data) {
    client.commit(['commit message here', 'relative/path/to/file'], function(err, data) {
        console.log('committed one file!');
    });
});
```

Run any svn command

```js
client.cmd(['subcommand', '--option1=xx', '--option2=xx', 'arg1', 'arg2'], function(err, data) {
    console.log('subcommand done');
});
```

## Result Object

`getXXX` methods will return parsed data as object.

`getInfo` result example:

```json
{
  "$": {
    "path": ".",
    "revision": "1",
    "kind": "dir"
  },
  "url": "file:///home/dong/projects/node-packages/node-svn-spawn/test/tmp/repo",
  "repository": {
    "root": "file:///home/dong/projects/node-packages/node-svn-spawn/test/tmp/repo",
    "uuid": "302eb8ee-a81a-4432-8477-1ad8fe3a9a1e"
  },
  "wc-info": {
    "wcroot-abspath": "/home/dong/projects/node-packages/node-svn-spawn/test/tmp/copy",
    "schedule": "normal",
    "depth": "infinity"
  },
  "commit": {
    "$": {
      "revision": "1"
    },
    "author": "dong",
    "date": "2013-11-08T02:07:25.884985Z"
  }
}
```

`getLog` result example:

```json
[
    {
      "$": {
        "revision": "1"
      },
      "author": "dong",
      "date": "2013-11-08T02:10:37.656902Z",
      "msg": "init repo"
    },
    ...
]
```

`getStatus` result example:

```json
[
  {
    "$": {
      "path": "a.txt"
    },
    "wc-status": {
      "$": {
        "props": "none",
        "item": "modified",
        "revision": "1"
      },
      "commit": {
        "$": {
          "revision": "1"
        },
        "author": "dong",
        "date": "2013-11-08T02:17:20.390152Z"
      }
    }
  }
]
```

## Requirements

You need to have the `svn` command installed.

## Installation

```bash
npm install svn-spawn
```

## Changelog

### v0.1.0 (2013-05-23)

Inital version

### v0.1.1 (2013-06-07)

Fix `addLocal` bug; add some tests

### v0.1.2 (2013-10-08)

Fix `checkout` bug(if target folder does not exist); fix `getLog` bug;travis-ci

### v0.1.3 (2013-11-08)

Detailed document for query result such as `svn info`, `svn log`, `svn status` etc.

### v0.1.4 (2013-12-12)

Add authontication support