import {
  findStatusWord,
  type StatusWord
} from '#/service/lib/yubikey/yubikey-client';

export class NextSiblingError extends Error {
  constructor(nodeName: string, parentName?: string) {
    super(
      `Cannot get next sibling of node "${nodeName}"${parentName ? ` with parent "${parentName}"` : ''}.`
    );
    this.name = 'NextSiblingError';
  }
}

export class ParentNotFoundError extends Error {
  constructor(nodeName: string) {
    super(`Cannot find parent of node "${nodeName}".`);
    this.name = 'ParentNotFoundError';
  }
}

export class FirstChildNotFoundError extends Error {
  constructor(nodeName: string) {
    super(`Cannot get first child of node "${nodeName}".`);
    this.name = 'FirstChildNotFoundError';
  }
}
export class ChildNodeNotFoundError extends Error {
  constructor(childName: string, parentName: string) {
    super(
      `Cannot remove child node "${childName}" from parent "${parentName}". Child not found.`
    );
    this.name = 'ChildNodeNotFoundError';
  }
}

export class SetPropertyError extends Error {
  constructor(propertyName: string, nodeName: string) {
    super(`Cannot set property "${propertyName}" of node "${nodeName}".`);
    this.name = 'SetPropertyError';
  }
}

export class RemoveNodeError extends Error {
  constructor(nodeName: string, parentName?: string) {
    super(
      `Cannot remove node "${nodeName}"${parentName ? ` from parent "${parentName}"` : ''}.`
    );
    this.name = 'RemoveNodeError';
  }
}

export class InsertNodeError extends Error {
  constructor(nodeName: string, parentName?: string) {
    super(
      `Cannot insert node "${nodeName}"${parentName ? ` into parent "${parentName}"` : ''}.`
    );
    this.name = 'InsertNodeError';
  }
}

export class TextNodeError extends Error {
  constructor(text: string) {
    super(
      `Cannot add node "${text}". Text nodes are not supported. Try <label text="${text.replaceAll('"', '\\"')}" /> instead.`
    );
    this.name = 'TextNodeError';
  }
}

export class UnsupportedPlatformError extends Error {
  constructor(platform: string) {
    super(`Unsupported platform: ${platform}`);
    this.name = 'UnsupportedPlatformError';
  }
}

export class NullDictionaryError extends Error {
  constructor() {
    super('Attempted to translate with `null` dictionary');
    this.name = 'NullDictionaryError';
  }
}

export class TypeNotImplementedError extends Error {
  constructor(type: string) {
    super(
      `Cannot create element type ${type}. Type ${type} is not implemented.`
    );
    this.name = 'TypeNotImplementedError';
  }
}

export class FolderUtilNotInitializedError extends Error {
  constructor(folder: string) {
    super(`Cannot access ${folder}. FolderUtil must be initialized first.`);
    this.name = 'FolderUtilNotInitializedError';
  }
}

export class NodeParentConflictError extends Error {
  constructor(
    childName: string,
    parentName: string,
    existingParentName: string
  ) {
    super(
      `Cannot add child node "${childName}" under parent node "${parentName}". Node "${childName}" already has another parent node "${existingParentName}".`
    );
    this.name = 'NodeParentConflictError';
  }
}

export class AnchorNodeNotFoundError extends Error {
  constructor(childName: string, parentName: string, anchorName: string) {
    super(
      `Cannot add child node "${childName}" under parent node "${parentName}". Could not find anchor node "${anchorName}".`
    );
    this.name = 'AnchorNodeNotFoundError';
  }
}

export class MaxChildrenExceededError extends Error {
  constructor(childName: string, parentName: string) {
    super(
      `Cannot add child node "${childName}" under parent node "${parentName}". Parent node "${parentName}" cannot have more than 1 child node.`
    );
    this.name = 'MaxChildrenExceededError';
  }
}

export class InvalidChildNodeTypeError extends Error {
  constructor(childName: string, parentName: string, expectedType: string) {
    super(
      `Cannot add child node "${childName}" under parent node "${parentName}". Parent node "${parentName}" only accepts child with node type "${expectedType}".`
    );
    this.name = 'InvalidChildNodeTypeError';
  }
}

export class ParentNodeChildLimitExceededError extends Error {
  constructor(childName: string, parentName: string) {
    super(
      `Cannot add child node "${childName}" under parent node "${parentName}". Parent node "${parentName}" cannot have more than 1 child node.`
    );
    this.name = 'ParentNodeChildLimitExceededError';
  }
}

export class UnsupportedPlatformElementError extends Error {
  constructor(elementName: string, platform: string) {
    super(
      `Cannot create element "${elementName}". This element is only supported on ${platform}.`
    );
    this.name = 'UnsupportedPlatformElementError';
  }
}

export class NodeCannotHaveChildrenError extends Error {
  constructor(childName: string, parentName: string) {
    super(
      `Cannot add child node "${childName}" under parent node "${parentName}". Node type "${parentName}" cannot have children`
    );
    this.name = 'NodeCannotHaveChildrenError';
  }
}

export class NodeHasNoChildrenError extends Error {
  constructor(childName: string, parentName: string) {
    super(
      `Cannot remove child node "${childName}" from parent "${parentName}". Node type "${parentName}" cannot have children`
    );
    this.name = 'NodeHasNoChildrenError';
  }
}

export class UnsupportedPropertyError extends Error {
  constructor(propertyName: string, elementType: string) {
    super(
      `Property "${propertyName}" is not supported for element type "${elementType}"`
    );
    this.name = 'UnsupportedPropertyError';
  }
}

export class SignatureNotFoundError extends Error {
  constructor() {
    super('Signature not found');
    this.name = 'SignatureNotFoundError';
  }
}

export class MissingTlvTagError extends Error {
  constructor(tag: number) {
    super(`Missing TLV tag 0x${tag.toString(16)}`);
    this.name = 'MissingTlvTagError';
  }
}

export class InvalidBlockLengthError extends Error {
  constructor(actualLength: number) {
    super(`Invalid block length: (expected 8, got ${actualLength})`);
    this.name = 'InvalidBlockLengthError';
  }
}

export class InvalidResultLengthError extends Error {
  constructor(expectedLength: number, actualLength: number) {
    super(
      `Invalid result length: (expected ${expectedLength}, got ${actualLength})`
    );
    this.name = 'InvalidResultLengthError';
  }
}

export class YubiKeyDetectionError extends Error {
  constructor(cause?: unknown) {
    super('Failed to detect YubiKey', { cause });
    this.name = 'YubiKeyDetectionError';
  }
}

export class AgeEncryptionError extends Error {
  constructor(cause?: unknown) {
    super('Failed to age encrypt', { cause });
    this.name = 'AgeEncryptionError';
  }
}

export class AgeDecryptionError extends Error {
  constructor(cause?: unknown) {
    super('Failed to age decrypt', { cause });
    this.name = 'AgeDecryptionError';
  }
}

export class SwError extends Error {
  sw: number;
  statusWord: StatusWord;

  constructor(message: string, sw: number) {
    super(message);

    this.name = 'SwError';
    this.sw = sw;
    this.statusWord = findStatusWord(sw);

    Object.setPrototypeOf(this, new.target.prototype);
  }

  hex() {
    return `0x${this.sw.toString(16).padStart(4, '0')}`;
  }
}

export class InvalidEpkLengthError extends Error {
  constructor() {
    super('Invalid EPK length for P-256 (expected 65 bytes)');
    this.name = 'InvalidEpkLengthError';
  }
}

export class ResponseTooShortError extends Error {
  constructor(length: number) {
    super(`Response too short: ${length}`);
    this.name = 'ResponseTooShortError';
  }
}

export class InvalidChallengeLengthError extends Error {
  constructor(length: number) {
    super(`Invalid challenge length: ${length}`);
    this.name = 'InvalidChallengeLengthError';
  }
}

export class InvalidManagementKeyError extends Error {
  constructor() {
    super('Invalid management key');
    this.name = 'InvalidManagementKeyError';
  }
}

export class InvalidDigestLengthError extends Error {
  constructor(length: number) {
    super(`Invalid digest length: ${length}`);
    this.name = 'InvalidDigestLengthError';
  }
}

export class PublicKeyNotFoundError extends Error {
  constructor() {
    super('Failed to get public key');
    this.name = 'PublicKeyNotFoundError';
  }
}

export class MissingObjectTagError extends Error {
  constructor(tag: number) {
    super(`Missing object data tag 0x${tag.toString(16)}`);
    this.name = 'MissingObjectTagError';
  }
}

export class MissingStanzaError extends Error {
  constructor() {
    super('Missing stanza');
    this.name = 'MissingStanzaError';
  }
}

export class InvalidOuterTlvError extends Error {
  constructor() {
    super('Invalid outer TLV');
    this.name = 'InvalidOuterTlvError';
  }
}

export class InvalidInnerTlvError extends Error {
  constructor() {
    super('Invalid inner TLV');
    this.name = 'InvalidInnerTlvError';
  }
}

export class InvalidFileKeyLengthError extends Error {
  constructor(length: number) {
    super(`invalid file key length: ${length}`);
    this.name = 'InvalidFileKeyLengthError';
  }
}

export class InvalidEphemeralKeyError extends Error {
  constructor() {
    super('invalid ephemeral key');
    this.name = 'InvalidEphemeralKeyError';
  }
}

export class NoUnlockedDatabaseError extends Error {
  constructor() {
    super('No unlocked DB Index');
    this.name = 'NoUnlockedDatabaseError';
  }
}

export class TimeoutError extends Error {
  constructor() {
    super('Timeout');
    this.name = 'TimeoutError';
  }
}

export class GenerateKeyFailedError extends SwError {
  constructor(sw: number) {
    super(`Failed to generate key: SW=${sw.toString(16)}`, sw);
    this.name = 'GenerateKeyFailedError';
  }
}

export class SelectOtpFailedError extends SwError {
  constructor(sw: number) {
    super(`Select OTP failed: SW=${sw.toString(16)}`, sw);
    this.name = 'SelectOtpFailedError';
  }
}

export class SelectPivFailedError extends SwError {
  constructor(sw: number) {
    super(`Select PIV failed: SW=${sw.toString(16)}`, sw);
    this.name = 'SelectPivFailedError';
  }
}

export class GetSerialNumberFailedError extends SwError {
  constructor(sw: number) {
    super(`Get serial number failed: SW=${sw.toString(16)}`, sw);
    this.name = 'GetSerialNumberFailedError';
  }
}

export class VerifyPinFailedError extends SwError {
  constructor(sw: number) {
    super(`Verify PIN failed: SW=${sw.toString(16)}`, sw);
    this.name = 'VerifyPinFailedError';
  }
}

export class GetChallengeFailedError extends SwError {
  constructor(sw: number) {
    super(`Failed to get challenge: SW=${sw.toString(16)}`, sw);
    this.name = 'GetChallengeFailedError';
  }
}

export class AuthenticationFailedError extends SwError {
  constructor(sw: number) {
    super(`Authentication failed: SW=${sw.toString(16)}`, sw);
    this.name = 'AuthenticationFailedError';
  }
}

export class SignFailedError extends SwError {
  constructor(sw: number) {
    super(`SIGN failed: SW=${sw.toString(16)}`, sw);
    this.name = 'SignFailedError';
  }
}

export class PutCertificateFailedError extends SwError {
  constructor(sw: number) {
    super(`PUT CERT failed ${sw.toString(16)}`, sw);
    this.name = 'PutCertificateFailedError';
  }
}

export class GetMetadataFailedError extends SwError {
  constructor(sw: number) {
    super(`GET METADATA failed: SW=${sw.toString(16)}`, sw);
    this.name = 'GetMetadataFailedError';
  }
}

export class GetObjectFailedError extends SwError {
  constructor(objectId: number, sw: number) {
    super(`Failed to get object ${objectId}: sw=${sw.toString(16)}`, sw);
    this.name = 'GetObjectFailedError';
  }
}

export class ObjectNotFoundError extends SwError {
  constructor(objectId: number, sw: number) {
    super(`Object ${objectId} not found`, sw);
    this.name = 'ObjectNotFoundError';
  }
}

export class YubiKeySwError extends SwError {
  constructor(sw: number) {
    super(`YubiKey returned SW=0x${sw.toString(16)}`, sw);
    this.name = 'YubiKeySwError';
  }
}
