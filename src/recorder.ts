import {
  convert,
  execPromise,
  mkTemp,
  recordWithFilter,
} from "audio-bash-utils";
import { readFileSync } from "fs";

interface RecorderConstructorProps {
  segmentTime: number;
  onSegmentation: (audioData: string) => Promise<void>;

  ttl: number;
  onTerminate: () => void;
}

export class Recorder {
  private intervalId: NodeJS.Timeout;
  private timeoutId: NodeJS.Timeout;

  constructor(private props: RecorderConstructorProps) {
    this.intervalId = this.setSegmentation();

    this.timeoutId = setTimeout(() => {
      this.stop();
    }, this.props.ttl * 1000);
  }

  stop() {
    clearTimeout(this.timeoutId);
    clearInterval(this.intervalId);
  }

  private setSegmentation() {
    return setInterval(async () => {
      const { outPath } = await recordWithFilter({
        duration: this.props.segmentTime,
      });

      const opusFilename = await mkTemp({
        dryRun: true,
        ext: ".opus",
      });

      await convert({
        filePath: outPath,
        outfilePath: opusFilename,
      });

      const fileData = readFileSync(opusFilename);
      const int8array = new Uint8Array(fileData);
      const dataString = `[${int8array}]`;

      await execPromise(`rm ${outPath} ${opusFilename}`);

      this.props.onSegmentation(dataString);
    }, this.props.segmentTime * 1000);
  }
}
