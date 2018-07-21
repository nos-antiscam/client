<h1 align="center">Anti-Scam Realtime Alert System</h1>

<p align="center">
  This is a dapp built on <strong>NOS platform</strong> for alerting users before they send any asset to a flagged address
</p>


**The testnet build is deployed on separate repository** - [here](https://github.com/shashank-ezdiagno/nos-antiscam-prod)

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
### Access Local Build
Now that your script is built, run the dapp
* Run nos-client
* Build the dapp - `yarn start`
* Navigate to localhost:1234 to run the dapp

### Access TestNet Build(No smart contract deployment needed)
* In NOS Client _settings_, change the **Selected Network** to **nOSNet**
* Navigate to _nos://antiscam.neo_


## Purpose
The purpose of this dapp is to alert the user before he sends an asset to a flagged address

## Dapp-UI Description
There is a form to start with - input address(or select from dropdown of favorites) to send asset(~~for now GAS is implemented~~ asset can be selected from dropdown)
Once the address is input and the focus is moved out of the address box,
following data is displayed related to the address:

* Whether the address is favorited by you(the owner address)
* Whether the address is flagged by you(the owner address)
* Number of times the address is flagged(overall)
* Comments added ~~by you(if any)~~ by anyone

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

Once you decide to send asset(~~GAS for now~~ selected from dropdown), input the amount and press the submit button.
You will get an alert with confirmation

## Todo
* ~~Check whether the input is a valid address~~
* ~~Implement more assets~~
* ~~Show comments from all~~
* ~~Implement Check Witness on contract~~
* Implement route to list all addresses favorited by you
* ~~Implement dropdown to select an address from favorites to send asset~~
* Create/Get App logo
* Concise UI - favorite text can be replaced with bookmark glyphicon(https://user-images.githubusercontent.com/23030886/42853958-310067dc-8a57-11e8-9630-9c2f3e1e79b2.png) which toggles between on/off
* Concise UI - flag text can be replaced with flag glyphicon(https://thumb1.shutterstock.com/display_pic_with_logo/188066402/774511030/stock-vector--flag-glyph-icon-774511030.jpg) which toggles between on/off and shows the count
* Save gas by adding a single call for getting all information
* Add a delay between successive invokes to limit the usage of gas

Feedbacks are welcome.

<strong>This project is licensed under the terms of the MIT license.</strong>
