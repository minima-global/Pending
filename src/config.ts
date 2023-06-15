export const maskParamCommand = {
  passwordMaskOptions: { maskWith: "*", maxMaskedCharacters: 128, unmaskedStartCharacters: 0, unmaskedEndCharacters: 0 },
  passwordFields: ['password'],
};

export const maskMdsCommand = {
  passwordMaskOptions: { maskWith: "*", maxMaskedCharacters: 24, unmaskedStartCharacters: 0, unmaskedEndCharacters: 0 },
  passwordFields: ['response.password'],
};

export const maskVaultCommand = {
  passwordMaskOptions: { maskWith: "*", maxMaskedCharacters: 24, unmaskedStartCharacters: 0, unmaskedEndCharacters: 0 },
  passwordFields: ['response.phrase', 'response.seed'],
};

export const maskVaultSetCommand = {
  passwordMaskOptions: { maskWith: "*", maxMaskedCharacters: 24, unmaskedStartCharacters: 0, unmaskedEndCharacters: 0 },
  passwordFields: ['params.password'],
};
