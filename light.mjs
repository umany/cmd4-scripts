#!/usr/bin/env node

import {
  execFileSync
} from 'child_process';
import storage from 'node-persist';

await storage.init();

var length = process.argv.length;
var device = "light";
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
      case "On": {
        if (device === 'night_light') {
          const night = await storage.getItem('night');
          console.log(night ? night : 0);
        } else {
          const on = await storage.getItem('on');
          console.log(on ? on : 0);
        }
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
      case "On": {
        if (device === 'night_light') {
          execFileSync('/home/dietpi/adrsirlib/ircontrol', ['send', (option === '1' ? 'night_light' : 'light_off')]);
          await storage.setItem('night', option);
          if (option === '1') {
            await storage.setItem('on', '0');
          }
          break;
        } else {
          execFileSync('/home/dietpi/adrsirlib/ircontrol', ['send', (option === '1' ? 'light_on' : 'light_off')]);
          await storage.setItem('on', option);
          if (option === '1') {
            await storage.setItem('night', '0');
          }
          break;
        }
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