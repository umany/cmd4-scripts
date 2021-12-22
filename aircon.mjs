#!/usr/bin/env node

import {
  execFileSync
} from 'child_process';
import storage from 'node-persist';

await storage.init();

var length = process.argv.length;
var device = "aircon";
var io = "";
var characteristic = "";
var option = "";

if (length == 2)
  process.exit(0);

if (length <= 2) {
  console.log("Usage: " + process.argv[0] + " < Get > < AccessoryName > < Characteristic >");
  console.log("       " + process.argv[0] + " < Set > < AccessoryName > < Characteristic > < Value >");
  process.exit(-1);
}

if (length >= 2)
  io = process.argv[2];
if (length >= 3)
  device = process.argv[3];
if (length >= 4)
  characteristic = process.argv[4];
if (length >= 5)
  option = process.argv[5];

switch (io) {
  case "Get": {
    switch (characteristic) {
      case "Active": {
        const active = await storage.getItem(characteristic);
        console.log(active ? active : 0);
        break;
      }
      case "CoolingThresholdTemperature": {
        const temperature = await storage.getItem(characteristic);
        console.log(temperature ? temperature : 26);
        break;
      }
      default:
        console.error("Unhandled characteristic for:" + io + " Device:" + device + " Characteristic:" + characteristic);
        process.exit(-1);
    }
    break;
  } // End of Switch for "Get"
  case "Set": {
    switch (characteristic) {
      case "Active": {
        const active = await storage.getItem(characteristic);
        if (active !== option) {
          const temperature = await storage.getItem('CoolingThresholdTemperature');
          if (option == '0') {
            execFileSync('/home/dietpi/adrsirlib/ircontrol', ['send', 'aircon_off']);
          } else {
            if (temperature > 26) {
              execFileSync('/home/dietpi/adrsirlib/ircontrol', ['send', 'aircon_kaimin']);
            } else if (temperature < 26) {
              execFileSync('/home/dietpi/adrsirlib/ircontrol', ['send', 'aircon_powerful']);
            } else {
              execFileSync('/home/dietpi/adrsirlib/ircontrol', ['send', 'aircon_on']);
            }
          }
        }
        await storage.setItem(characteristic, option);
        break;
      }
      case "CoolingThresholdTemperature": {
        if (option > 26) {
          execFileSync('/home/dietpi/adrsirlib/ircontrol', ['send', 'aircon_kaimin']);
        } else if (option < 26) {
          execFileSync('/home/dietpi/adrsirlib/ircontrol', ['send', 'aircon_powerful']);
        } else {
          execFileSync('/home/dietpi/adrsirlib/ircontrol', ['send', 'aircon_on']);
        }
        await storage.setItem(characteristic, option);
        break;
      }
      default:
        console.error("UnHandled Characteristic for:" + io + " Device:" + device + " Characteristic:" + characteristic);
        process.exit(-1);
    }
    break;
  } // End of Switch Device for "Set"
  default:
    console.error("Unknown IO" + io);
    process.exit(-1);
}

//console.log( "Say What Device:" + device + " Characteristic:" + characteristic + " Option:" + option );

// You must exit with a zero status, confirming the script rannsuccessfully.
process.exit(0);