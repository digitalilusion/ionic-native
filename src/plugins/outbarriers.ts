import { Plugin, getPromise } from './plugin';
import { Observable } from 'rxjs/Observable';

declare var outbarriers: any;

export interface Outbeacon {
  /**
   * The 128-UUID that identifies the match between App and Outbarriers' beacon.
   * Using the Outbarriers' API REST you can check if the match was real and when
   */
  match: string;

  /**
   * RSSI in dbm when the match ocurrs. Less values indicates nearest positions
   */
  rssi: number;

  /**
   * Approximation of proximity to the beacon.
   * Values are "near", "far", "veryfar" and  "unknown"
   */
  proximity: 'near' | 'far' | 'veryfar' | 'unknown';

  /**
   * Name of the shop or POI where is beacon is located
   */
  name: string;

  /**
   * Accesibility information for visually impaired about the place and
   * how to access to inside
   */
  accesibility: string;
  /**
   * Latitude coordinate in "GPS" format (WGS84)
   */
  lat: number;

  /**
   * Longitude coordinate in "GPS" format (WGS84)
   */
  lng: number;

  /**
   * Address of the venue where the Outbarriers' beacon is on
   */
  location: string;

  /**
   * URL of the website of the venue
   */
  url: string;
  /**
   * Custom payload set by the Application attached to that
   * Outbarriers' beacon
   */
  payload: string;

}

export type DetectionMode = 'walk' | 'looking' | 'stay';

/**
 * @name Outbarriers
 * @description
 * This plugin provides access to the Outbarriers' Beacon Network
 *
 * @usage
 * ```
 * import { Outbarriers } from 'ionic-native';
 *
 * Outbarriers.init(apiKey, apiSecret)
 *   .then(() => console.log("Outbarriers API OK"))
 *   .catch((error: any) => console.log(error));
 *
 * ```
 */
@Plugin({
  pluginName: 'Outbarriers',
  plugin: 'cordova-plugin-outbarriers', // npm package name, example: cordova-plugin-camera
  pluginRef: 'outbarriers', // the variable reference to call the plugin, example: navigator.geolocation
  repo: 'https://bitbucket.org/digitalilusion/cordova-plugin-outbarriers',
  platforms: ['Android', 'iOS']
})
export class Outbarriers {

  private static delegate = null;
  private static obs: any = null;
  private static observable: Observable<Outbeacon> = null;
  private static resolveIsDetecting: any = null;
  private static resolveIsBluetoothSupported: any = null;
  private static resolveIsBluetoothEnabled: any = null;
  /**
   * Initialize Outbarriers SDK Client
   * @param apiKey {string} API Key ID of Outbarriers' App API
   * @param apiSecret {string} API Secret of Outbarriers' App API
   * @return {Promise<void>} Returns a promise that resolves when something happens
   */

  static init(apiKey: string, apiSecret: string): Promise<void> {
    this.checkDelegate();
    let p = getPromise( (resolve, reject) => {
      this.delegate.onInit = (status, err) => {
        if (status) {
          resolve();
        } else {
          reject(err);
        }
      };
    });
    outbarriers.init(apiKey, apiSecret, this.delegate);
    return p;
  }

  /**
   * Starts the detection of Outbarriers' beacon
   * NOTE: You must call "init" before
   */
  static startDetection() {
    this.checkDelegate();
    outbarriers.startDetection();
  }

  /**
   * Stop the detection of Outbarriers' beacon
   * NOTE: You must call "init" before
   */
  static stopDetection() {
    this.checkDelegate();
    outbarriers.stopDetection();
  }

  /**
   * Set detection mode profile
   * Each profile specifies different scan times depend on apps requirements
   * The mode can be change during runtime
   * Default: "walk"
   * @param mode {DetectionMode} Enum values: "walk", "looking" or "stay"
   */
  static setMode(mode: DetectionMode) {
    this.checkDelegate();
    outbarriers.setMode(mode);
  }

  /**
   * Set custom detection times
   * Change the detection time process (timeScan) and the time between detection cycles
   @param timeScan {number} Time in milliseconds to detect in the cycle
   @param timeBetweenScan {number} Time in milliseconds to wait between detection cycles
   */
  static setCustomMode(timeScan: number, timeBetweenScan: number) {
    this.checkDelegate();
    outbarriers.setCustomMode(timeScan, timeBetweenScan);
  }

  /**
   * The detected Outbeacon information
   * @return {Observable<Outbeacon>} Returns a observable where the Outbeacon information is observed
   */
  static onOutbeaconDetected(): Observable<Outbeacon> {
    this.checkDelegate();
    return this.observable;
  }

  /**
   * Check if the detection process is ongoing
   * @return {Promise<boolean>} Returns a promise that resolves to true if a detection process is ongoing, false in other case
   */
  static isDetecting(): Promise<boolean> {
      this.checkDelegate();
      return new Promise( (resolve, reject) => {
        this.resolveIsDetecting = resolve;
      });
  }
  /**
   * Check if the device support Bluetooth Smart
   * @return {Promise<boolean>} Returns a promise that resolves to true if the device supports BLE (aka Bluetooth Smart), false in other case
   */
  static isBluetoothSupported(): Promise<boolean> {
    this.checkDelegate();
    return new Promise( (resolve, reject) => {
      this.resolveIsBluetoothSupported = resolve;
    });
  }
  /**
   * Check if the device has Bluetooth power on
   * @return {Promise<boolean>} Returns a promise that resolves to true if the device has Bluetooth power on, false in other case
   */
  static isBluetoothEnabled(): Promise<boolean> {
    this.checkDelegate();
    return new Promise( (resolve, reject) => {
      this.resolveIsBluetoothEnabled = resolve;
    });
  }

  // PRIVATE
  private static checkDelegate() {
    if (this.delegate == null) {
      this.observable = Observable.create(observer => {
        this.obs = observer;
      });
      this.delegate = new outbarriers.OBDelegate();
      this.delegate.onOutbeaconDetected = (res: Outbeacon) => {
        this.obs.next(res);
      };
      this.delegate.onIsDetecting = isDetecting => {
        if (this.resolveIsDetecting != null) {
          this.resolveIsDetecting(isDetecting);
        }
      };
      this.delegate.onIsBluetoothSupported = isSupported => {
        if (this.resolveIsBluetoothSupported != null) {
          this.resolveIsBluetoothSupported(isSupported);
        }
      };
      this.delegate.onIsBluetoothEnabled = isEnabled => {
        if (this.resolveIsBluetoothEnabled != null) {
          this.resolveIsBluetoothEnabled(isEnabled);
        }
      };

    }
  }
}
