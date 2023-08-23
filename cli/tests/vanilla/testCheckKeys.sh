#!/bin/bash

set -e

BASE_DIR="$(dirname "$BASH_SOURCE")"

. "$BASE_DIR"/../prepare_test.sh

ZKEYS_DIR="$BASE_DIR"/../zkeys


# test if keys are set correctly given a set of files
echo "init maci"
init_maci

echo "check vk"
$MACI_CLI checkVerifyingKey \
    --state-tree-depth 10 \
    --int-state-tree-depth 1 \
    --msg-tree-depth 2 \
    --vote-option-tree-depth 2 \
    --msg-batch-depth 1 \
    --process-messages-zkey "$ZKEYS_DIR"/ProcessMessages_10-2-1-2_test.0.zkey \
    --tally-votes-zkey "$ZKEYS_DIR"/TallyVotes_10-1-2_test.0.zkey


