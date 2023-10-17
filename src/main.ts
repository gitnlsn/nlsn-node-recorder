import getopts from "getopts";
import { Recorder } from "./recorder";
import axios from "axios";
import { TranscriptionResponse } from "./TranscriptionResponse";

interface MainProps {
  ttl: number;
  segmentTime: number;
  endpoint: string;
}

const main = async ({ endpoint, segmentTime, ttl }: MainProps) => {
  new Recorder({
    ttl,
    segmentTime,
    onSegmentation: async (audioData) => {
      try {
        const date = new Date(new Date().getTime() - segmentTime * 1000);
        const {
          data: { speeches },
        } = await axios.post<TranscriptionResponse>(endpoint, audioData, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log(`${date.toLocaleString()}: ${speeches[0].text}`);
      } catch (error) {
        console.error(error);
      }
    },
    onTerminate: () => {
      console.log("\nTerminated");
    },
  });
};

const { endpoint, ttl, segmentTime } = getopts(process.argv.slice(2), {
  string: ["endpoint", "ttl", "segmentTime"],
});

main({
  endpoint: endpoint ?? "http://localhost:8080",
  segmentTime:
    Number.isFinite(Number(segmentTime)) && Number(segmentTime)
      ? Number(segmentTime)
      : 10,
  ttl: Number.isFinite(Number(ttl)) && Number(ttl) ? Number(ttl) : 3600,
}).catch(console.error);
