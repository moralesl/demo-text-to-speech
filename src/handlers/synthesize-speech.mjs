import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
const polly = new PollyClient({
  region: "eu-central-1",
});

export const handler = async (event) => {
  // All log statements are written to CloudWatch
  console.info("received:", event);

  if (event.httpMethod !== "POST") {
    throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
  }

  try {
    // Parse the incoming event body
    const body = JSON.parse(event.body);

    // Get the text from the message body
    const message = body.message;

    // Configure Polly parameters
    const params = {
      Text: message,
      OutputFormat: "mp3",
      VoiceId: "Joanna", // You can choose a different voice here
      TextType: "text",
    };

    // Synthesize speech using Polly
    const result = await polly.send(new SynthesizeSpeechCommand(params));
    console.log("Result:", result);

    // Convert the audio data to base64 encoding
    const audioData = await result.AudioStream?.transformToString("base64");

    // Return base64 encoded audio in the response
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "audio/mpeg",
      },
      body: audioData,
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "An error occurred" }),
    };
  }
};
