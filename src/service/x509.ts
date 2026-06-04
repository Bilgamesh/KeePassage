import crypto from 'node:crypto';
import { BitString, Integer, Utf8String } from 'asn1js';
import {
  AlgorithmIdentifier,
  AttributeTypeAndValue,
  Certificate,
  PublicKeyInfo
} from 'pkijs';
import {
  InvalidBlockLengthError,
  InvalidResultLengthError
} from '#/data/errors';

const ALGORITHM_ID = '1.2.840.10045.4.3.2';

type SignFunction = (
  digest: Uint8Array<ArrayBuffer>
) => Promise<Uint8Array<ArrayBufferLike>>;

function decryptManagementChallenge3DES(
  key: Uint8Array,
  encryptedBlock: Uint8Array
): Uint8Array {
  const blockLength = encryptedBlock.length;
  if (blockLength !== 8) throw new InvalidBlockLengthError(blockLength);

  const decipher = crypto.createDecipheriv('des-ede3-ecb', key, null);
  decipher.setAutoPadding(false);

  const decrypted = decipher.update(encryptedBlock);
  const finalPart = decipher.final();

  if (finalPart.length > 0)
    console.warn('Warning: Unexpected decipher.final() data with 3DES');

  const result = Buffer.concat([decrypted, finalPart]);
  const resLen = result.length;
  if (resLen !== 8) throw new InvalidResultLengthError(8, resLen);

  return new Uint8Array(result);
}

async function generateSelfSignedCertificate(options: {
  publicKey: Uint8Array<ArrayBufferLike>;
  sign: SignFunction;
}) {
  const rawEcPoint = options.publicKey.slice(2);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new Uint8Array(rawEcPoint),
    {
      name: 'ECDSA',
      namedCurve: 'P-256'
    },
    true,
    []
  );
  const cert = new Certificate();
  cert.version = 2;
  cert.serialNumber = new Integer({
    value: Date.now()
  });
  cert.issuer.typesAndValues.push(
    new AttributeTypeAndValue({
      type: '2.5.4.3',
      value: new Utf8String({
        value: 'YubiKey Self Signed'
      })
    })
  );
  cert.subject.typesAndValues.push(
    new AttributeTypeAndValue({
      type: '2.5.4.3',
      value: new Utf8String({
        value: 'YubiKey Self Signed'
      })
    })
  );
  cert.notBefore.value = new Date();
  cert.notAfter.value = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  const publicKeyInfo = new PublicKeyInfo();
  await publicKeyInfo.importKey(cryptoKey);
  cert.subjectPublicKeyInfo = publicKeyInfo;
  cert.signature = new AlgorithmIdentifier({
    algorithmId: ALGORITHM_ID
  });
  cert.signatureAlgorithm = new AlgorithmIdentifier({
    algorithmId: ALGORITHM_ID
  });
  const tbs = cert.encodeTBS().toBER(false);
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', tbs));
  const signature = await options.sign(digest);
  cert.signatureValue = new BitString({
    valueHex: signature
  });
  const certDer = new Uint8Array(cert.toSchema(true).toBER(false));
  return certDer;
}

export { decryptManagementChallenge3DES, generateSelfSignedCertificate };
