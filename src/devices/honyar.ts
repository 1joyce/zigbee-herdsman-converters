import {Definition} from '../lib/types';
import * as exposes from '../lib/exposes';
import * as reporting from '../lib/reporting';
import extend from '../lib/extend';
import fz from '../converters/fromZigbee';
import tz from '../converters/toZigbee';
const e = exposes.presets;

const definitions: Definition[] = [
    {
        zigbeeModel: ['00500c35'],
        model: 'U86K31ND6',
        vendor: 'Honyar',
        description: '3 gang switch ',
        extend: extend.switch(),
        exposes: [e.switch().withEndpoint('left'), e.switch().withEndpoint('right'), e.switch().withEndpoint('center')],
        endpoint: (device) => {
            return {'left': 1, 'center': 2, 'right': 3};
        },
        configure: async (device, coordinatorEndpoint, logger) => {
            const endpoint1 = device.getEndpoint(1);
            const endpoint2 = device.getEndpoint(2);
            const endpoint3 = device.getEndpoint(3);
            await reporting.bind(endpoint1, coordinatorEndpoint, ['genOnOff']);
            await reporting.onOff(endpoint1);
            await reporting.bind(endpoint2, coordinatorEndpoint, ['genOnOff']);
            await reporting.onOff(endpoint2);
            await reporting.bind(endpoint3, coordinatorEndpoint, ['genOnOff']);
            await reporting.onOff(endpoint3);
        },
    },
    {
        zigbeeModel: ['HY0043'],
        model: 'U86Z13A16-ZJH(HA)',
        vendor: 'Honyar',
        description: 'Smart Power Socket 16A (with power monitoring)',
        fromZigbee: [fz.on_off, fz.electrical_measurement, fz.metering],
        toZigbee: [tz.on_off],
        exposes: [e.switch(), e.power(), e.current(), e.voltage(), e.energy()],
        configure: async (device, coordinatorEndpoint, logger) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'haElectricalMeasurement', 'seMetering']);
            await reporting.onOff(endpoint);
            await reporting.readEletricalMeasurementMultiplierDivisors(endpoint);
            await reporting.activePower(endpoint);
            await reporting.rmsCurrent(endpoint);
            await reporting.rmsVoltage(endpoint);
            await reporting.readMeteringMultiplierDivisor(endpoint);
            await reporting.currentSummDelivered(endpoint);
        },
    },
    {
        zigbeeModel: ['HY0157'],
        model: 'U86Z223A10-ZJU01(GD)',
        vendor: 'Honyar',
        description: 'Smart power socket 10A with USB (with power monitoring)',
        fromZigbee: [fz.on_off, fz.electrical_measurement, fz.metering],
        toZigbee: [tz.on_off],
        exposes: [
            e.switch().withEndpoint('l1'), e.switch().withEndpoint('l2'),
            e.power().withEndpoint('l1'), e.current().withEndpoint('l1'),
            e.voltage().withEndpoint('l1'), e.energy(),
        ],
        endpoint: (device) => {
            return {l1: 1, l2: 2};
        },
        configure: async (device, coordinatorEndpoint, logger) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'haElectricalMeasurement', 'seMetering']);
            await endpoint.read('haElectricalMeasurement', ['acPowerMultiplier', 'acPowerDivisor',
                'acCurrentDivisor', 'acCurrentMultiplier', 'acVoltageDivisor', 'acVoltageMultiplier']);
            await reporting.activePower(endpoint, {min: 10, change: 10});
            await reporting.rmsCurrent(endpoint, {min: 10, change: 50});
            await reporting.rmsVoltage(endpoint, {min: 10, change: 10});
            await reporting.currentSummDelivered(endpoint, {min: 10});
            await reporting.onOff(endpoint, {min: 10});
            await reporting.readMeteringMultiplierDivisor(endpoint);
            endpoint.saveClusterAttributeKeyValue('seMetering', {divisor: 1000, multiplier: 1});
            endpoint.saveClusterAttributeKeyValue('haElectricalMeasurement', {acVoltageMultiplier: 1,
                acVoltageDivisor: 10, acCurrentMultiplier: 1, acCurrentDivisor: 1000, acPowerMultiplier: 1, acPowerDivisor: 10});
        },
    },
];

module.exports = definitions;
