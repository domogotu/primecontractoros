import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getDb } from "../db";
import { workspaceSettings } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region: string;
}

export async function getS3Config(workspaceId: number): Promise<S3Config | null> {
  const db = await getDb();
  if (!db) return null;
  const settings = await db
    .select()
    .from(workspaceSettings)
    .where(eq(workspaceSettings.workspaceId, workspaceId));

  const settingsMap: Record<string, string> = {};
  for (const s of settings) {
    if (s.settingValue) settingsMap[s.settingKey] = s.settingValue;
  }

  const accessKeyId = settingsMap["s3_access_key_id"];
  const secretAccessKey = settingsMap["s3_secret_access_key"];
  const bucket = settingsMap["s3_bucket"];
  const region = settingsMap["s3_region"];

  if (!accessKeyId || !secretAccessKey || !bucket || !region) {
    return null;
  }

  return { accessKeyId, secretAccessKey, bucket, region };
}

function createS3Client(config: S3Config): S3Client {
  return new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export async function uploadToS3(
  config: S3Config,
  key: string,
  data: Buffer | Uint8Array,
  contentType: string
): Promise<{ key: string; url: string }> {
  const client = createS3Client(config);
  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: data,
      ContentType: contentType,
    })
  );
  // Return a reference URL (presigned URL will be generated on access)
  return { key, url: `s3://${config.bucket}/${key}` };
}

export async function getPresignedDownloadUrl(
  config: S3Config,
  key: string,
  expiresIn = 3600
): Promise<string> {
  const client = createS3Client(config);
  const command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: key,
  });
  return getSignedUrl(client, command, { expiresIn });
}

export async function deleteFromS3(config: S3Config, key: string): Promise<void> {
  const client = createS3Client(config);
  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key,
    })
  );
}

export async function getPresignedUploadUrl(
  config: S3Config,
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const client = createS3Client(config);
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(client, command, { expiresIn });
}
