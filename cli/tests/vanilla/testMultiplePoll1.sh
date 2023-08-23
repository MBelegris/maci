#!/bin/bash

set -e

BASE_DIR="$(dirname "$BASH_SOURCE")"

. "$BASE_DIR"/../prepare_test.sh

# one signup and one valid message for multiple polls
#!/bin/bash
clean

POLL_ID=0

init_maci
deploy_poll

echo "Signup 1"
$MACI_CLI signup \
    --pubkey macipk.3e7bb2d7f0a1b7e980f1b6f363d1e3b7a12b9ae354c2cd60a9cfa9fd12917391 \


echo "Publish 1"
$MACI_CLI publish \
    --pubkey macipk.3e7bb2d7f0a1b7e980f1b6f363d1e3b7a12b9ae354c2cd60a9cfa9fd12917391 \
    --privkey macisk.fd7aa614ec4a82716ffc219c24fd7e7b52a2b63b5afb17e81c22fe21515539c \
    --state-index 1 \
    --vote-option-index 0 \
    --new-vote-weight 9 \
    --nonce 1 \
    --poll-id "$POLL_ID"

$MACI_CLI timeTravel \
    --seconds 500

echo "Gen proofs 1"
gen_proofs "$POLL_ID"

echo "Prove and Verify on Chain 1"
prove_and_verify_on_chain "$POLL_ID"


clean


POLL_ID=1
deploy_poll

echo "Publish 2"
$MACI_CLI publish \
    --pubkey macipk.3e7bb2d7f0a1b7e980f1b6f363d1e3b7a12b9ae354c2cd60a9cfa9fd12917391 \
    --privkey macisk.fd7aa614ec4a82716ffc219c24fd7e7b52a2b63b5afb17e81c22fe21515539c \
    --state-index 1 \
    --vote-option-index 0 \
    --new-vote-weight 7 \
    --nonce 1 \
    --poll-id "$POLL_ID"

$MACI_CLI timeTravel \
    --seconds 500

echo "Gen proofs 2"
gen_proofs "$POLL_ID"

echo "Prove and Verify on Chain"
prove_and_verify_on_chain "$POLL_ID"

