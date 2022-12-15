import React, { useCallback } from "react";
import { ParametersType } from "../api";
import { FieldArray, useField } from "formik";
import {
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  IconButton,
  Input,
  VStack,
} from "@chakra-ui/react";
import { t } from "@lingui/macro";
import { DeleteIcon } from "@chakra-ui/icons";

const ParameterFormField: React.FC<{
  name: string;
  type: ParametersType;
  label?: string;
  disabled: boolean;
  placeholder?: string;
}> = ({ name, type, label, disabled, placeholder }) => {
  const [field, meta] = useField(name);

  return (
    <FormControl
      isDisabled={disabled}
      isInvalid={!!(meta.touched && meta.error)}
    >
      {label ? (
        <FormLabel>
          {label}({type})
        </FormLabel>
      ) : null}
      {type === ParametersType.STRING ? (
        <Input placeholder={placeholder} {...field} variant="default" />
      ) : null}
      {type === ParametersType.OBJECT ? (
        <Input placeholder={placeholder} {...field} variant="default" />
      ) : null}
      {type === ParametersType.NUMBER ? (
        <Input
          type={"number"}
          placeholder={placeholder}
          {...field}
          variant="default"
        />
      ) : null}
      {type === ParametersType.BOOLEAN ? (
        <Checkbox {...field} isChecked={!!field.value} variant="default">
          {placeholder}
        </Checkbox>
      ) : null}
      <FormErrorMessage>{meta.error}</FormErrorMessage>
    </FormControl>
  );
};
const ParameterArrayFormField: React.FC<{
  name: string;
  type: ParametersType;
  label: string;
  disabled: boolean;
}> = ({ name, label, type, disabled }) => {
  const [field] = useField(name);

  const getType = useCallback(() => {
    return type.replace("[]", "") as ParametersType;
  }, [type]);

  return (
    <FieldArray name={name}>
      {({ remove, push }) => {
        return (
          <FormControl isDisabled={disabled}>
            <HStack alignItems="baseline">
              <FormLabel>
                {label}({type})
              </FormLabel>
              {!disabled ? (
                <Button size="xs" onClick={() => push("")}>
                  {t`Add field`}
                </Button>
              ) : null}
            </HStack>

            {(field.value || []).length ? (
              <VStack alignItems="flex-start">
                {(field.value || []).map((_: unknown, index: number) => (
                  <HStack key={`${name}.${index}`} w={"100%"} pl={2}>
                    <ParameterFormField
                      disabled={disabled}
                      name={`${name}.${index}`}
                      type={getType()}
                      placeholder={`${name}.${index}`}
                    />
                    {disabled ? null : (
                      <IconButton
                        aria-label={
                          /* eslint-disable-next-line string-to-lingui/missing-lingui-transformation */
                          "Delete"
                        }
                        onClick={() => remove(index)}
                        icon={<DeleteIcon />}
                      />
                    )}
                  </HStack>
                ))}
              </VStack>
            ) : null}
          </FormControl>
        );
      }}
    </FieldArray>
  );
};
export const ParametersFormField: React.FC<{
  name: string;
  type: ParametersType;
  label: string;
  disabled: boolean;
  placeholder?: string;
}> = ({ name, type, label, disabled, placeholder }) => {
  if (
    [
      ParametersType["ARRAY<STRING>"],
      ParametersType["ARRAY<BOOLEAN>"],
      ParametersType["ARRAY<NUMBER>"],
      ParametersType["ARRAY<OBJECT>"],
    ].includes(type)
  ) {
    return (
      <ParameterArrayFormField
        disabled={disabled}
        name={name}
        type={type}
        label={label}
      />
    );
  }

  return (
    <ParameterFormField
      placeholder={placeholder}
      disabled={disabled}
      name={name}
      type={type}
      label={label}
    />
  );
};
