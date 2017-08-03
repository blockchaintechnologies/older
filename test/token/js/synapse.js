var Web3 = require('web3');

var web3 = new Web3();
var CONTRACTS;
var DEFAULT_ACCOUNT;
var GEN_UNIT = 100000000;
var user = {};

$('#setprovider').click(function () {
   var provider = $('#network').val(); 
   setProvider(provider);
  CONTRACTS = { 'GenToken': web3.eth.contract(GEN_SPECS['GenToken']['abi']).at(GEN_SPECS['GenToken']['address']), }

console.log(CONTRACTS);
});

function setProvider(network){
    console.log(network);
    web3.setProvider(new web3.providers.HttpProvider(network));
    DEFAULT_ACCOUNT = web3.eth.accounts[0];
}

$('#set_caddress').click(function(){
  GEN_SPECS['GenToken']['address'] = $('#contract_address').val();	

});
$('#set_abi').click(function(){
  GEN_SPECS['GenToken']['abi'] = JSON.parse($('#abi').val());	
});

$("#clear_console").click(function(){
  $('#console').html("");
});

$('#setcontract').click(function(){
   var specs = $('#abis').val(); 
   setContract(specs);
});

function setContract(GEN_SPECS){
    CONTRACTS = { 'GenToken': web3.eth.contract(GEN_SPECS['GenToken']['abi']).at(GEN_SPECS['GenToken']['address']), }
}

$('#signinpk').click(function () {

    priv = $('#pkin').val();
    user = generateAddress(priv, false);
    console.log(user);

    var privateKeyRaw = user['private_key_raw'];
    var userAddress = user['address'];

    //store user data
    $('.userPrivateKey').text("0x"+privateKeyRaw);
    $('.userPrivateKey').val("0x"+privateKeyRaw);
    $('.userAddress').text('0x' + userAddress);

    //display
    display('signin');


    $('#currentUserBalancesSpan').text("loading...");
    updateBalances(userAddress);
});



$('#signin').click(function () {

    log('test');
    var addressSeed = $('#addressSeed').val();
    user = generateAddress(addressSeed, true);
    console.log(user);

    var privateKeyRaw = user['private_key_raw'];
    var userAddress = user['address'];

    //store user data
    $('.userPrivateKey').text(privateKeyRaw);
    $('.userPrivateKey').val(privateKeyRaw);
    $('.userAddress').text('0x' + userAddress);

    //display
    display('signin');


    $('#currentUserBalancesSpan').text("loading...");
    updateBalances(userAddress);
});

$('#initialize').click(function(){

    var privateKeyHex = user['private_key_raw'];
    var gas = $('#init_gas').val();
    var token_address = $('#token_address').val();
    var preblock = $('#preblock').val();
    var blackoutblock = $('#blackoutblock').val();
    var icoblock = $('#icoblock').val();
    var endblock = $('#endblock').val();
    var baseRate = $('#baseRate').val();
    var preICORate = $('#preICORate').val();

    initialize(privateKeyHex, gas, token_address, preblock, blackoutblock, icoblock, endblock, baseRate, preICORate);
});






$('#buy').click(function(){
		var investmentAmount = $('#buyAmount').val();
    var privateKeyHex = user['private_key_raw'];
		buyTokens(investmentAmount, privateKeyHex);
});


$('#transfer').click(function(){
log('test');
	var dest = $('#transferDestination').val();	
	var cur = $('#transferCurrency').val();
	var amount = $('#transferAmount').val();								
 
	transfer(user.private_key, amount, dest, cur);
 
});

function display(state){

	switch(state){
		case 'signin':
			$('#currentUserAddress').show();
			$('#fakePK').hide();
			$('#fakeAddress').hide();
			$('#currentUserPrivateKeySpan').show();
			$('#currentUserAddressSpan').show();
			break;
		default:
			break;
	}
}

function updateBalances(userAddress){

	setTimeout(function() {
		var balanceGEN = getBalanceGEN(userAddress, true).toLocaleString();
		var balanceETH = getBalanceETH(userAddress, true).toLocaleString();
		$('#currentUserBalancesSpan').text(balanceGEN + ' GEN - ' + balanceETH + ' ETH');
	}, 1);
}


function generateAddress(from, seed = false) {
		if(from.substring(0,2) != '0x'){
			from  = '0x'+from;
		}
		var privateKeyRaw = from;
    if (seed) {
        addressSeed = from;
        // Create private key from seed
        privateKeyRaw = web3.sha3(addressSeed);
    }
    var privateKey = buffer.Buffer.from(privateKeyRaw.substr(2), 'hex');
    // Generate address from private key
    var wallet = EthJS.Wallet.fromPrivateKey(privateKey);
    var userAddress = wallet.getAddress().toString('hex');

    return { 'address': userAddress, 'private_key': privateKey, 'private_key_raw': privateKeyRaw }
}


function buyTokens(buyAmount, privateKeyHex) {
    var buyDestination = GEN_SPECS['GenToken']['address'];
    unlock();

	privateKey = privateKeyHex.substr(2)
	broadcastData(buyDestination, privateKey, "0x", web3.toWei(buyAmount), 300000);
}


function transfer(privateKeyHex, transferAmount, transferDestination, transferCurrency) {

    unlock();

    if (transferCurrency == "ETH") {
        broadcastData(transferDestination, privateKeyHex, "0x", web3.toWei(transferAmount), 300000);
    } else { // GEN
        var DATA = CONTRACTS['GenToken'].transfer.getData(
          transferDestination,
          web3.fromDecimal(transferAmount) * GEN_UNIT
        );
        broadcastData(GEN_SPECS['GenToken']['address'], privateKeyHex, DATA, 0, 300000);
    }
}


function initialize(privateKeyHex, gas, token_address, preblock, blackoutblock, icoblock, endblock, baseRate, preICORate){

log(web3.fromDecimal(parseInt(token_address)));
log(web3.fromDecimal(parseInt(preblock)));
log(web3.fromDecimal(parseInt(blackoutblock)));
log(web3.fromDecimal(parseInt(icoblock)));
log(web3.fromDecimal(parseInt(endblock)));
log(web3.fromDecimal(parseInt(baseRate)));
log(web3.fromDecimal(parseInt(preICORate)));


    var DATA = CONTRACTS['GenToken'].initialize.getData(
        token_address,
        web3.fromDecimal(parseInt(preblock)),
        web3.fromDecimal(parseInt(blackoutblock)),
        web3.fromDecimal(parseInt(icoblock)),
        web3.fromDecimal(parseInt(endblock)),
        web3.fromDecimal(parseInt(baseRate)),
        web3.fromDecimal(parseInt(preICORate))         
    );

    // Broadcast data
    broadcastData(GEN_SPECS['GenToken']['address'], privateKeyHex.substr(2), DATA, 0, 4700000);
}

/*
 * GETTERS
 */
$('#getPeriod').click(function(){
    getPeriod();
});
function getPeriod() {
    unlock();

    var period = CONTRACTS['GenToken'].getPeriod.call();
    log("getPeriod "+ period.toString());
    return period.toNumber();
}
$('#blocksInPeriod').click(function(){
    blocksInPeriod();
});
function blocksInPeriod() {
    unlock();

    var blocks = CONTRACTS['GenToken'].blocksInPeriod.call();
    log("blocksInPeriod "+blocks.toString());
    return blocks.toNumber();
}
$('#remaining_tokens').click(function(){
    remainingTokensPeriod();
});
function remainingTokensPeriod() {
    unlock();

    var balance = CONTRACTS['GenToken'].remainingTokensPeriod.call();
    log("remainingTokensPeriod "+ balance);
    return balance.toNumber();
}
$('#holder_count').click(function(){
    holderCount();
});
function holderCount(userAddress, returnBalance) {
    unlock();

    var holders = CONTRACTS['GenToken'].holderCount.call();
    log("holderCount "+ holders.toString());
    return holders.toNumber();
}

function getBalanceGEN(userAddress, returnBalance) {
    unlock();

    var address = '0x' + (userAddress || $('#getBalanceAddress').val());
    var balance = CONTRACTS['GenToken'].balanceOf.call(address);
    log(balance);

		return balance.toNumber() / GEN_UNIT;
}

function getBalanceETH(userAddress, returnBalance) {
    unlock();

    var address = '0x' + (userAddress || $('#getBalanceAddress').val());
    var balance = web3.eth.getBalance(address);
    log(balance);
		
		return web3.fromWei(balance);
}

function unlock() {
    web3.eth.defaultAccount = DEFAULT_ACCOUNT
		/*
		testrpc doesnt support web3.personal api
		*/
    //web3.personal.unlockAccount(DEFAULT_ACCOUNT, "toto");
}


function broadcastData(toAddress, privateKeyHex, data, value, gasLimit) {
    var pk = buffer.Buffer.from(privateKeyHex, 'hex');
    var senderAddress = "0x" + EthJS.Wallet.fromPrivateKey(pk).getAddress().toString('hex');

    log("Transaction data: " + data);

    var tx = new EthJS.Tx({
      nonce: web3.toHex(web3.eth.getTransactionCount(senderAddress)),
      gasLimit: web3.toHex(gasLimit),
      gasPrice: web3.toHex(web3.eth.gasPrice),
      to: toAddress,
      value: web3.toHex(value),
      data: data
    });

    tx.sign(pk);

    var rawTransaction = '0x' + tx.serialize().toString('hex')

		log('sending');
    web3.eth.sendRawTransaction(rawTransaction, function (err, hash) {
        if (err) {
					log(err);
        } else {
            waitTransactionReceipt(hash);
        }
    });
}

function waitTransactionReceipt(hash) {
		log('waiting for '+hash+' to be mined');
    var receipt = web3.eth.getTransactionReceipt(hash);
    if (receipt) {
			log(receipt)
    } else {
        setTimeout(waitTransactionReceipt, 1000, hash);
    }
}




/*
Utility Functions
*/

function log(s, color) {
    console.log(s)
    var line = $("<div>").text(s);
    if (color) line.css("color", color)
    $("#console").append(line);
    $("#console").scrollTop($("#console")[0].scrollHeight);
}