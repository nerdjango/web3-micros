# web3-micros (Web3 Security)

## Components

### contracts:

Contains a smart contract in the solidity vulnerable to a Reentrancy attack.

### notifier:

Monitors the mempool, and when the transaction is in the Mempool but is yet to be executed (or added in the next block), it flags this transaction as a suspicious transaction and notifiers owner after the transaction is blocked.

### blocker:

After a transaction has been flagged as a suspicious transaction by the notifier, this microservice triggers a transaction that pauses the vulnerable contract before the suspicious transaction occurs. This is done by setting a gas value for this transaction that is higher gas than the previous transaction to front-run this transaction.
