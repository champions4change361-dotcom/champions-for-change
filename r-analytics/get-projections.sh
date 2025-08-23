#!/bin/bash
cd "$(dirname "$0")"
R --slave --no-restore --file=test-api.R
