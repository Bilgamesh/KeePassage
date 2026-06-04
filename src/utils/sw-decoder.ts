type SwCategory =
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'security'
  | 'unknown';

type SwLabel =
  | 'SUCCESS'
  | 'BYTES_REMAINING'
  | 'NO_INPUT_DATA'
  | 'VERIFY_FAILED_0'
  | 'VERIFY_FAILED_1'
  | 'VERIFY_FAILED_2'
  | 'VERIFY_FAILED_3'
  | 'WRONG_LENGTH'
  | 'SECURITY_CONDITION_NOT_SATISFIED'
  | 'AUTHENTICATION_BLOCKED'
  | 'DATA_INVALID'
  | 'CONDITIONS_NOT_SATISFIED'
  | 'COMMAND_NOT_ALLOWED'
  | 'INCORRECT_PARAMETERS'
  | 'NOT_FOUND'
  | 'NO_SPACE'
  | 'INCORRECT_SLOT'
  | 'NOT_SUPPORTED'
  | 'COMMAND_ABORTED'
  | 'UNKNOWN';

type SwInfo = {
  code: number;
  label: SwLabel;
  description: string;
  category: SwCategory;
};

function decodeSw(sw: number): SwInfo {
  const sw1 = (sw >> 8) & 0xff;
  const sw2 = sw & 0xff;

  if (sw === 0x9000)
    return {
      code: sw,
      label: 'SUCCESS',
      description: 'Command completed successfully',
      category: 'success'
    };

  if (sw1 === 0x61)
    return {
      code: sw,
      label: 'BYTES_REMAINING',
      description: `More data available: ${sw2} bytes`,
      category: 'info'
    };

  if (sw === 0x6285)
    return {
      code: sw,
      label: 'NO_INPUT_DATA',
      description: 'No input data available',
      category: 'warning'
    };

  if (sw1 === 0x63) {
    if (sw2 === 0xc0)
      return {
        code: sw,
        label: 'VERIFY_FAILED_0',
        description: 'Verify failed, 0 tries left',
        category: 'security'
      };
    if (sw2 === 0xc1)
      return {
        code: sw,
        label: 'VERIFY_FAILED_1',
        description: 'Verify failed, 1 try left',
        category: 'security'
      };
    if (sw2 === 0xc2)
      return {
        code: sw,
        label: 'VERIFY_FAILED_2',
        description: 'Verify failed, 2 tries left',
        category: 'security'
      };
    if (sw2 === 0xc3)
      return {
        code: sw,
        label: 'VERIFY_FAILED_3',
        description: 'Verify failed, 3 tries left',
        category: 'security'
      };
  }

  if (sw === 0x6700)
    return {
      code: sw,
      label: 'WRONG_LENGTH',
      description: 'Wrong length',
      category: 'error'
    };

  if (sw1 === 0x69) {
    if (sw2 === 0x82)
      return {
        code: sw,
        label: 'SECURITY_CONDITION_NOT_SATISFIED',
        description: 'Security condition not satisfied',
        category: 'security'
      };
    if (sw2 === 0x83)
      return {
        code: sw,
        label: 'AUTHENTICATION_BLOCKED',
        description: 'Authentication blocked',
        category: 'security'
      };
    if (sw2 === 0x84)
      return {
        code: sw,
        label: 'DATA_INVALID',
        description: 'Data invalid',
        category: 'security'
      };
    if (sw2 === 0x85)
      return {
        code: sw,
        label: 'CONDITIONS_NOT_SATISFIED',
        description: 'Conditions not satisfied',
        category: 'security'
      };
    if (sw2 === 0x86)
      return {
        code: sw,
        label: 'COMMAND_NOT_ALLOWED',
        description: 'Command not allowed',
        category: 'security'
      };
  }

  if (sw1 === 0x6a) {
    if (sw2 === 0x80)
      return {
        code: sw,
        label: 'INCORRECT_PARAMETERS',
        description: 'Incorrect parameters',
        category: 'error'
      };
    if (sw2 === 0x82)
      return {
        code: sw,
        label: 'NOT_FOUND',
        description: 'Not found',
        category: 'error'
      };
    if (sw2 === 0x84)
      return {
        code: sw,
        label: 'NO_SPACE',
        description: 'No space available',
        category: 'error'
      };
  }

  if (sw === 0x6b00)
    return {
      code: sw,
      label: 'INCORRECT_SLOT',
      description: 'Incorrect slot',
      category: 'error'
    };

  if (sw === 0x6d00)
    return {
      code: sw,
      label: 'NOT_SUPPORTED',
      description: 'Instruction not supported',
      category: 'error'
    };

  if (sw === 0x6f00)
    return {
      code: sw,
      label: 'COMMAND_ABORTED',
      description: 'Command aborted',
      category: 'error'
    };

  return {
    code: sw,
    label: 'UNKNOWN',
    description: `Unknown SW 0x${sw.toString(16).toUpperCase()}`,
    category: 'unknown'
  };
}

export { decodeSw, type SwInfo, type SwLabel, type SwCategory };
