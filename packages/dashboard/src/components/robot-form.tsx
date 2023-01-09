import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { Field, FieldProps, Form, Formik } from "formik";
import React from "react";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker.css";

export const RobotForm: React.FC<{
  robotId: string | undefined;
}> = ({ robotId }) => {
  switch (robotId) {
    case "4bb5c65c-84f7-428b-a865-a19a7e0f7d75":
      return (
        <Formik
          initialValues={{
            // _id: "",
            name: "",
            description: "",
            // templateId: "string",
            expiration: 6,
          }}
          onSubmit={(values, actions) => {
            console.log(values);
            actions.setSubmitting(false);
          }}
        >
          {({ isSubmitting }) => (
            <Form style={{ width: "100%" }}>
              <Stack spacing="4" mb={4}>
                <Field name="name">
                  {({ field, meta }: FieldProps) => {
                    return (
                      <FormControl isInvalid={!!(meta.touched && meta.error)}>
                        <FormLabel>
                          <Trans>Workflow name:</Trans>
                        </FormLabel>
                        <Input {...field} variant="default" />
                        <FormErrorMessage>{meta.error}</FormErrorMessage>
                      </FormControl>
                    );
                  }}
                </Field>

                <Field name="description">
                  {({ field, meta }: FieldProps) => {
                    return (
                      <FormControl isInvalid={!!(meta.touched && meta.error)}>
                        <FormLabel>
                          <Trans>Workflow description:</Trans>
                        </FormLabel>
                        <Input
                          placeholder={t`Optional description`}
                          {...field}
                          variant="default"
                        />
                        <FormErrorMessage>{meta.error}</FormErrorMessage>
                      </FormControl>
                    );
                  }}
                </Field>

                {/* {(templateParameters || [])
              .filter(({ direction }) => direction === "in")
              .sort((a, b) => (a.name > b.name ? -1 : 1))
              .map(({ type, name }) => (
                <ParametersFormField
                  key={name}
                  type={type}
                  label={t`Input argument: ${name}`}
                  placeholder={t`Input argument: ${name}`}
                  disabled={false}
                  name={`defaultArguments.${name}`}
                />
              ))} */}

                <Button
                  isLoading={isSubmitting}
                  type="submit"
                  variant={"submitBtn"}
                >
                  {/* {initialValues._id ? t`Update workflow` : t`Create workflow`} */}
                  Execute
                </Button>
              </Stack>
            </Form>
          )}
        </Formik>
      );

    default:
      return <div>123</div>;
  }
};
