import { Input as TamaguiInput, styled } from 'tamagui';

export const Input = styled(TamaguiInput, {
  name: 'CafeInput',
  bw: 2,
  bc: '$cardBorder',
  bg: '$cardBg',
  outlineStyle: 'none',
  outlineColor: 'transparent',
  placeholderTextColor: '$gray500',
  
  focusStyle: {
    boc: '$brandMain',
    outlineStyle: 'none',
    outlineColor: 'transparent',
    boxShadow: 'none',
  },
});