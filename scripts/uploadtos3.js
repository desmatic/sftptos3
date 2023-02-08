import { S3 } from "aws-sdk"
import sftpClient from "ssh2-sftp-client"
import { fileTypeFromBuffer } from 'file-type'

const s3Client = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

export async function uploadtoS3(s3Data) {
    console.info("---- UPLODAING TO S3", s3Data.Bucket, s3Data.Key);
    try {
        return await s3Client.upload(s3Data).promise();
    } catch (error) {
        console.log(error);
        return error;
    }
}

export const uploadFile = async () => {
    try {
        const d = new Date()
        const today = `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`
        const sftp = new sftpClient()
        const sftpSSHKey = ""

        return sftp
            .connect({
                host: process.env.SFTP_HOST,
                username: process.env.SFTP_USER,
                privateKey: sftpSSHKey,
            })
            .then(async () => {
                const bodyData = await sftp.get('remote/file');
                const contentType = fileTypeFromBuffer(bodyData);
                await uploadtoS3({
                    Bucket: process.env.FEED_BUCKET,
                    Body: bodyData,
                    ContentType: contentType,
                    Key: `${today}/feed.json`,
                })
                return formatJSONResponse({
                    message: "File downloaded and transformed successfully!",
                })
            })
            .catch((err) => {
                console.log("Catch Error: ", err)
                throw new Error(err)
            })
    } catch (error) {
        console.log(error)
        return internalServerError(error)
    }
}

uploadFile()
