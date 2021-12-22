#!/usr/bin/env node

import {
  execFileSync
} from 'child_process';
import storage from 'node-persist';

await storage.init();

var length = process.argv.length;
var device = "fan";
var io = "";
var characteristic = "";
var option = "";

if (length == 2) {
  process.exit(0);
}

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
      case "RotationSpeed": {
        console.log(50);
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
        if (active != option) {
          execFileSync('/home/dietpi/adrsirlib/ircontrol', ['send', 'fan_power']);
          await storage.setItem(characteristic, option);
        }
        break;
      }
      case "RotationSpeed": {
        execFileSync('/home/dietpi/adrsirlib/ircontrol', ['send', option > 50 ? 'fan_up' : 'fan_down']);
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