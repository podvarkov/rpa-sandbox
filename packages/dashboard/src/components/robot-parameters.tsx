import { FormControl, FormErrorMessage, FormLabel } from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import { Field, FieldProps } from "formik";
import React from "react";
import DatePicker from "react-datepicker";

export const RobotParameters: React.FC<{
  robotId: string | undefined;
}> = ({ robotId }) => {
  switch (robotId) {
    case "4bb5c65c-84f7-428b-a865-a19a7e0f7d75":
      return (
        <>
          <Field name="arguments.startedDate" required>
            {({ field, meta, form }: FieldProps) => {
              return (
                <FormControl as="fieldset">
                  <FormLabel as="legend">
                    <Trans> Report data start date</Trans>
                  </FormLabel>
                  <div className="react-datepicker__field-wrapper">
                    <DatePicker
                      required
                      dateFormat="MM/yyyy"
                      showMonthYearPicker
                      selected={field.value}
                      onChange={(d) => form.setFieldValue(field.name, d)}
                    />
                  </div>

                  <FormErrorMessage>{meta.error}</FormErrorMessage>
                </FormControl>
              );
            }}
          </Field>
          <Field name="arguments.endDate" required>
            {({ field, meta, form }: FieldProps) => {
              return (
                <FormControl as="fieldset">
                  <FormLabel as="legend">
                    <Trans> Report data end date</Trans>
                  </FormLabel>
                  <div className="react-datepicker__field-wrapper">
                    <DatePicker
                      required
                      dateFormat="MM/yyyy"
                      showMonthYearPicker
                      selected={field.value}
                      onChange={(d) => form.setFieldValue(field.name, d)}
                    />
                  </div>

                  <FormErrorMessage>{meta.error}</FormErrorMessage>
                </FormControl>
              );
            }}
          </Field>
        </>
      );
    case "name2":
      return <>2</>;

    default:
      return <></>;
  }
};
