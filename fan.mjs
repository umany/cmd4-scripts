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
        const speed = await storage.getItem(characteristic);
        console.log(speed ? speed * 10 : 0);
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
          await storage.setItem(characteristic, option);
          execFileSync('/home/dietpi/adrsirlib/ircontrol', ['send', 'fan_power']);
        }
        break;
      }
      case "RotationSpeed": {
        const active = await storage.getItem("Active");
        if (active == "0") {
          await storage.setItem("Active", "1");
          execFileSync('/home/dietpi/adrsirlib/ircontrol', ['send', 'fan_power']);
        }
        let speed = Math.floor(option / 10);
        if (speed > 8) {
          speed = 8;
        } else if (speed < 1) {
          speed = 1;
        }
        const prev_speed = await storage.getItem(characteristic);
        const step = Math.abs(speed - prev_speed);
        await storage.setItem(characteristic, speed);
        for (let i = 0; i < step; i++) {
          execFileSync('/home/dietpi/adrsirlib/ircontrol', ['send', speed > prev_speed ? 'fan_up' : 'fan_down']);
        }
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