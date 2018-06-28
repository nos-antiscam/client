<h1 align="center">Anti-Scam Realtime Alert System</h1>

<p align="center">
  This is a dapp built on <strong>NOS platform</strong> for alerting users before they send any asset to a flagged address
</p>

## Prerequisites
* Copy contract from `./contracts/contract.py` to `<nos-local>/contracts` folder
* Run nos-local shell
* Build the contract in shell
```
open wallet ./neo-privnet.wallet
build /smart-contracts/contract.py
import contract /smart-contracts/contract.avm 0710 05 True False
```
* Retrieve the script hash - check the hash should be the same as in `./src/components/NOSActions/index.jsx`

## Getting started
Now that your script is built, run the dapp
* Run nos-client
* Build the dapp - `yarn start`
* Navigate to localhost:1234 to run the dapp


## Purpose
The purpose of this dapp is to alert the user before he sends an asset to a flagged address

## Dapp-UI Description
There is a form to start with - input address to send asset(for now GAS is implemented)
Once the address is input and the focus is moved out of the address box,
following data is displayed related to the address:

* Whether the address is favorited by you(the owner address)
* Whether the address is flagged by you(the owner address)
* Number of times the address is flagged(overall)
* Comments added by you(if any) - this will change to comments by anyone

There are a set of buttons to perform certain action on the address as well:

* Flag/unflag/Check Flag address
* Favorite/unfavorite/Check Favorite address
* Add comments

After every invoke action, there is a delay to confirm the block. So, wait for another
block to check whether your action has been performed.
For example - if you flag an address, wait for another block to check if the address
has been flagged.

Check whether the address has been flagged and decide whether you want to send the
asset to it or not. "Address is secure" text is an assurance that no one has flagged that address
and it is secure to send asset to that address.

Once you decide to send asset(GAS for now), input the amount and press the submit button.
You will get an alert with confirmation

## Todo
* Check whether the input is a valid address
* Implement more assets
* Show comments from all

Feedbacks are welcome.
