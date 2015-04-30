#!/bin/bash

BASEDIR=$(cd "$(dirname "$0")"; pwd)
mkdir $BASEDIR/tmp
rm -rf $BASEDIR/tmp/*
svnadmin create $BASEDIR/tmp/repo
svn checkout file://$BASEDIR/tmp/repo $BASEDIR/tmp/copy
cp -r $BASEDIR/source/* $BASEDIR/tmp/copy
cd $BASEDIR/tmp/copy
svn st | grep "^\?" | awk "{print \$2}" | xargs svn add $1
svn commit -m 'init repo'
cd $BASEDIR
rm -rf $BASEDIR/tmp/copy