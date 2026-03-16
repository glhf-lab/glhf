module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: env("UPLOAD_PROVIDER"),
      providerOptions: {
        baseUrl: env("S3_BASE_URL"),
        s3Options: {
          accessKeyId: env("S3_ACCESS_KEY_ID"),
          secretAccessKey: env("S3_ACCESS_SECRET"),
          region: env("S3_REGION"),
          endpoint: env("S3_ENDPOINT"),
          params: {
            Bucket: env("S3_BUCKET"),
          },
        },
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});
