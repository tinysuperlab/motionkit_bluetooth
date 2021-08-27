//% weight=100 color=#00A654 icon="\uf1b9" block="MotionKit"
namespace MotionKit {

	
    /*some parameters used for controlling the turn and length */
    const microSecInASecond = 1000000
    let distancePerSec = 100
    let numberOfDegreesPerSec = 200
    let timeout = 0
    
        /* sender or receiver role
     * false = sender
     * true = receiver
     */
    let btrole = 0

    //flag for initialization
    let isinitialized = false

    //light follower pin
    let lfpin = DigitalPin.C18

    
    /**
     * @param PIN Gib den Pin an, an dem die Lichtfolgerplatine angeschlossen ist, z.B.: DigitalPin.C18 , DigitalPin.C17
     */
    //% blockId=motion_kit_readLightfollower
    //% block="read light follower on pin | %PIN"
    //% block.loc.de="lies Lichtfolger an Pin| %PIN"
    export function readLightfollower(PIN: DigitalPin): number {
        lfpin = PIN
        if ((PIN == DigitalPin.C18) || (PIN == DigitalPin.C17)) {
            if (pins.digitalReadPin(PIN) == 1) {
                return 1
            } else {
                return 0
            }
        }
        return 0
    }


    export enum side {
        //% block="links"
        Left = 0,
        //% block="rechts"
        Right = 1
    }
    
    /**
     * Gib an, wie du auf das Licht reagieren möchtest. Kommt das Licht von links oder rechts?
     * @param value can be Left or Right, eg: Left
     */
    //% blockId=motion_kit_getLightDirection
    //% block="light direction is | %value"
    //% block.loc.de="Licht kommt von | %value"
    export function getLightDirection(value: side): boolean {
        if (pins.digitalReadPin(lfpin) == value) {
            return true;
        } else {
            return false;
        }
    }
   
     
   	let x = 0
	let y = 0
	let sl = 0
	let sr = 0

	const hysterese = 10

    /**
     * Drives forwards. Call stop to stop
     */
    //% blockId=motion_kit_servos_forward
    //% block="drive forward"
    //% block.loc.de="vorwärts fahren"
    export function forward(): void {
        pins.servoWritePin(AnalogPin.C16, 0);
        pins.servoWritePin(AnalogPin.C17, 180);
    }

    /**
     * Drives backwards. Call stop to stop
     */
    //% blockId=motion_kit_servos_backward
    //% block="drive backward"
    //% block.loc.de="rückwärts fahren"
    export function backward(): void {
        pins.servoWritePin(AnalogPin.C16, 180);
        pins.servoWritePin(AnalogPin.C17, 0);
    }

    /**
	* Turns left. Call stop to stop
	*/
    //% blockId=motion_kit_servos_left
    //% block="turn left"
    //% block.loc.de="links drehen"
    export function left(): void {
        pins.servoWritePin(AnalogPin.C16, 80);
        pins.servoWritePin(AnalogPin.C17, 80); //0
    }

	/**
	 * Turns right. Call ``stop`` to stop
	 */
    //% blockId=motion_kit_servos_right
    //% block="turn right"
    //% block.loc.de="rechts drehen"
    export function right(): void {
        pins.servoWritePin(AnalogPin.C16, 100);
        pins.servoWritePin(AnalogPin.C17, 100); //180
    }

	/**
	 * Stop for 360 servos.
	 * rather than write 90, which may not stop the servo moving if it is out of trim
	 * this stops sending servo pulses, which has the same effect.
	 * On a normal servo this will stop the servo where it is, rather than return it to neutral position.
	 * It will also not provide any holding force.
     */
    //% blockId=motion_kit_servos_stop
    //% block="stop"
    //% block.loc.de="anhalten"
    export function stop(): void {
        pins.analogWritePin(AnalogPin.C16, 0);
        pins.analogWritePin(AnalogPin.C17, 0);
    }

	/**
	 * Sends servos to 'neutral' position.
	 * On a well trimmed 360 this is stationary, on a normal servo this is 90 degrees.
     */
    //% blockId=motion_kit_servos_neutral
    //% block="goto neutral position"
    //% block.loc.de="Neutrale Position"
    export function neutral(): void {
        pins.servoWritePin(AnalogPin.C16, 90);
        pins.servoWritePin(AnalogPin.C17, 90);
    }

    /**
     * Drives forwards the requested distance and then stops
     * @param howFar distance to move
     */
    //% blockId=motion_kit_drive_forwards
    //% block="drive forwards %howFar|distance" 
    //% block.loc.de="fahre %howFar|vorwärts"
    export function driveForwards(howFar: number): void {
        let timeToWait = (howFar * microSecInASecond) / distancePerSec; // calculation done this way round to avoid zero rounding
        forward();
        control.waitMicros(timeToWait);
        stop();
    }

    /**
     * Drives backwards the requested distance and then stops
     * @param howFar distance to move
     */
    //% blockId=motion_kit_drive_backwards
    //% block="drive backwards %howFar|distance" 
    //% block.loc.de="fahre %howFar|rückwärts"
    export function driveBackwards(howFar: number): void {
        let timeToWait = (howFar * microSecInASecond) / distancePerSec; // calculation done this way round to avoid zero rounding
        backward();
        control.waitMicros(timeToWait);
        stop();
    }

    /**
     * Turns right through the requested degrees and then stops
     * needs NumberOfDegreesPerSec tuned to make accurate, as it uses
     * a simple turn, wait, stop method.
     * Runs the servos at slower than the right function to reduce wheel slip
     * @param deg how far to turn, eg: 90
     */
    //% blockId=motion_kit_turn_right
    //% block="turn right %deg|degrees"
    //% block.loc.de="drehe %howFar|Grad rechts"
    export function turnRight(deg: number): void {
        let timeToWait = (deg * microSecInASecond) / numberOfDegreesPerSec;// calculation done this way round to avoid zero rounding
        pins.servoWritePin(AnalogPin.C16, 130);
        pins.servoWritePin(AnalogPin.C17, 130);
        control.waitMicros(timeToWait);
        stop();
    }

    /**
    * Turns left through the requested degrees and then stops
    * needs NumberOfDegreesPerSec tuned to make accurate, as it uses
    * a simple turn, wait, stop method.
    * Runs the servos at slower than the right function to reduce wheel slip
    * @param deg how far to turn, eg: 90
    */
    //% blockId=motion_kit_turn_left
    //% block="turn left %deg|degrees"
    //% block.loc.de="drehe %howFar|Grad links"
    export function turnLeft(deg: number): void {
        let timeToWait = (deg * microSecInASecond) / numberOfDegreesPerSec;// calculation done this way round to avoid zero rounding
        pins.servoWritePin(AnalogPin.C16, 50);
        pins.servoWritePin(AnalogPin.C17, 50);
        control.waitMicros(timeToWait);
        stop()
    }

	/**
     * Allows the setting of the turn speed.
     * This allows tuning for the turn x degrees commands
     * @param degPerSec : How many degrees per second it does.
     */
    //% blockId=motion_kit_set_turn_speed_param
    //% block="calibrate turn speed with %DegPerSec| default (300)"
    //% block.loc.de="kalibriere Drehgeschwindigkeit mit %degPerSec| Standard (300)"
    export function setDegreesPerSecond(degPerSec: number): void {
        numberOfDegreesPerSec = degPerSec
    }

    /**
     * Allows the setting for forward / reverse speed.
     * This allows tuning for the move x distance commands
     * @param DegPerSec : How many degrees per second it does.
     */
    //% blockId=motion_kit_set_movement_speed_param 
    //% block="calibrate forward speed with %DistPerSec| (default = 300)"
    //% block.loc.de="kalibriere Fahrgeschwindigkeit mit %distPerSec| Standard (300)"
    export function setDistancePerSecond(distPerSec: number): void {
        distancePerSec = distPerSec
    }
}
