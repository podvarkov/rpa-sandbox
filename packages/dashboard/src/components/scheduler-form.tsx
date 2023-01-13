import {
  CalendarIcon,
  EditIcon,
  RepeatClockIcon,
  SettingsIcon,
} from "@chakra-ui/icons";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Select,
  Stack,
  VStack,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { Field, FieldProps, Form, Formik } from "formik";
import React from "react";
import DatePicker from "react-datepicker";
import { Workflow } from "../api";

const CheckboxGroup: React.FC<{
  items: Array<{ value: string; title: string }>;
  onChange: (value: string[]) => void;
  value?: string[];
}> = ({ items, onChange, value }) => {
  return (
    <HStack spacing={4} pl={8}>
      {items.map((item) => (
        <Checkbox
          size="md"
          key={item.value}
          value={item.value}
          isChecked={value?.some((v) => v === item.value)}
          onChange={(e) => {
            if (e.target.checked) {
              onChange(value ? [...value, e.target.value] : [e.target.value]);
            } else {
              onChange(
                value?.filter((v: string) => v !== e.target.value) || []
              );
            }
          }}
        >
          {item.title}
        </Checkbox>
      ))}
    </HStack>
  );
};

const frequencies = {
  MINUTELY: 5,
  HOURLY: 4,
  DAILY: 3,
  WEEKLY: 2,
  MONTHLY: 1,
};

const getPreset = (
  freq: string
): {
  interval: number | undefined;
  freq: number | undefined;
  byweekday: number[] | undefined;
  until: Date | undefined;
  preset: string;
} => {
  switch (freq) {
    case "MINUTELY":
      return {
        preset: "MINUTELY",
        interval: 1,
        freq: frequencies.MINUTELY,
        until: undefined,
        byweekday: undefined,
      };
    case "HOURLY":
      return {
        preset: "HOURLY",
        interval: 1,
        freq: frequencies.HOURLY,
        until: undefined,
        byweekday: undefined,
      };
    case "DAILY":
      return {
        preset: "DAILY",
        interval: 1,
        freq: frequencies.DAILY,
        until: undefined,
        byweekday: undefined,
      };
    case "WEEKLY":
      return {
        preset: "WEEKLY",
        interval: 1,
        freq: frequencies.WEEKLY,
        byweekday: [new Date().getDay()],
        until: undefined,
      };
    case "MONTHLY":
      return {
        preset: "MONTHLY",
        interval: 1,
        freq: frequencies.MONTHLY,
        until: undefined,
        byweekday: undefined,
      };
    case "WORKDAYS":
      return {
        preset: "WORKDAYS",
        interval: 1,
        freq: frequencies.WEEKLY,
        byweekday: [1, 2, 3, 4, 5],
        until: undefined,
      };
    default:
    case "NO_REPEAT":
      return {
        preset: "NO_REPEAT",
        interval: undefined,
        freq: undefined,
        byweekday: undefined,
        until: undefined,
      };
    case "CUSTOM":
      return {
        preset: "CUSTOM",
        interval: 1,
        freq: frequencies.WEEKLY,
        byweekday: [new Date().getDay()],
        until: undefined,
      };
  }
};

export type EventFormValues = {
  _id?: string;
  workflowId: string;
  name: string;
  rrule: {
    dtstart: Date;
    preset: string;
    interval: number | undefined;
    freq: number | undefined;
    byweekday: number[] | undefined;
    until: Date | undefined;
  };
};

export const createDefaultEvent = ({
  workflowId,
  name,
}: {
  workflowId: string;
  name: string;
}): EventFormValues => {
  return {
    workflowId,
    name,
    rrule: {
      dtstart: new Date(),
      ...getPreset("NO_REPEAT"),
    },
  };
};

export const SchedulerForm: React.FC<{
  onSubmit: (values: EventFormValues) => Promise<unknown>;
  workflows: Workflow[];
  event?: EventFormValues;
}> = ({ onSubmit, event, workflows }) => {
  return (
    <Formik
      initialValues={
        event
          ? {
              ...event,
              rrule: {
                ...event.rrule,
                dtstart: new Date(event.rrule.dtstart),
                until: event.rrule.until
                  ? new Date(event.rrule.until)
                  : undefined,
              },
            }
          : createDefaultEvent({ workflowId: workflows[0]?._id, name: "" })
      }
      onSubmit={(values, actions) => {
        onSubmit({
          ...values,
          rrule: {
            ...values.rrule,
            freq: values.rrule.freq
              ? Number.parseInt(values.rrule.freq as unknown as string)
              : undefined,
          },
        }).finally(() => actions.setSubmitting(false));
      }}
    >
      {(form) => (
        <Form style={{ width: "100%", marginBottom: 12 }}>
          <Stack spacing="4">
            <Field name="name">
              {({ field, meta }: FieldProps) => (
                <FormControl isInvalid={!!(meta.touched && meta.error)}>
                  <HStack spacing={4}>
                    <EditIcon color="gray.300" />
                    <Input
                      required
                      variant="default"
                      placeholder={t`Enter event title`}
                      {...field}
                    />
                  </HStack>
                  <FormErrorMessage>{meta.error}</FormErrorMessage>
                </FormControl>
              )}
            </Field>

            <Field name="workflowId">
              {({ field, meta }: FieldProps) => (
                <FormControl isInvalid={!!(meta.touched && meta.error)}>
                  <HStack spacing={4}>
                    <SettingsIcon color="gray.300" />
                    <Select required variant="default" {...field}>
                      {workflows.map((wf) => (
                        <option key={wf._id} value={wf._id}>
                          {wf.name}
                        </option>
                      ))}
                    </Select>
                  </HStack>
                </FormControl>
              )}
            </Field>

            <Field name="rrule.dtstart">
              {({ field, meta }: FieldProps) => (
                <FormControl isInvalid={!!(meta.touched && meta.error)}>
                  <HStack spacing={4}>
                    <CalendarIcon color="gray.300" />
                    <div className="react-datepicker__field-wrapper">
                      <DatePicker
                        minDate={new Date()}
                        showTimeSelect
                        timeIntervals={1}
                        dateFormat="Pp"
                        selected={field.value}
                        onChange={(d) => form.setFieldValue(field.name, d)}
                      />
                    </div>
                  </HStack>
                  <FormErrorMessage>{meta.error}</FormErrorMessage>
                </FormControl>
              )}
            </Field>

            <Field name="rrule.preset">
              {({ field }: FieldProps) => (
                <HStack spacing={4}>
                  <RepeatClockIcon color="gray.300" />
                  <Select
                    variant="default"
                    {...field}
                    onChange={(e) => {
                      const preset = getPreset(e.target.value);
                      if (preset) {
                        form.setFieldValue("rrule", {
                          ...form.getFieldProps("rrule").value,
                          ...preset,
                        });
                      }
                    }}
                  >
                    <option value="NO_REPEAT">
                      <Trans>Do not repeat</Trans>
                    </option>
                    <option value={"MINUTELY"}>
                      <Trans>Every minute</Trans>
                    </option>
                    <option value={"HOURLY"}>
                      <Trans>Every hour</Trans>
                    </option>
                    <option value={"DAILY"}>
                      <Trans>Every day</Trans>
                    </option>
                    <option value={"WEEKLY"}>
                      <Trans>Every week</Trans>
                    </option>
                    <option value={"MONTHLY"}>
                      <Trans>Every month</Trans>
                    </option>
                    <option value={"WORKDAYS"}>
                      <Trans>Work days</Trans>
                    </option>
                    <option value="CUSTOM">
                      <Trans>Custom</Trans>
                    </option>
                  </Select>
                </HStack>
              )}
            </Field>

            {form.getFieldProps("rrule.preset").value === "CUSTOM" ? (
              <>
                <HStack pl={8}>
                  <Box flex={"50%"}>
                    <Trans>Repeat interval:</Trans>
                  </Box>
                  <Field name="rrule.interval">
                    {({ field, meta }: FieldProps) => (
                      <FormControl
                        flex={"20%"}
                        isInvalid={!!(meta.touched && meta.error)}
                      >
                        <Input
                          variant="default"
                          required
                          type="number"
                          {...field}
                        />
                      </FormControl>
                    )}
                  </Field>

                  <Field name="rrule.freq">
                    {({ field, meta }: FieldProps) => (
                      <FormControl
                        flex={"30%"}
                        isInvalid={!!(meta.touched && meta.error)}
                      >
                        <Select
                          variant="default"
                          {...field}
                          onChange={(e) => {
                            if (
                              Number.parseInt(e.target.value) ===
                              frequencies.WEEKLY
                            ) {
                              form.setFieldValue("rrule.byweekday", [
                                new Date().getDay(),
                              ]);
                            } else {
                              form.setFieldValue("rrule.byweekday", undefined);
                            }

                            field.onChange(e);
                          }}
                        >
                          <option value={5}>
                            <Trans>Minute</Trans>
                          </option>
                          <option value={4}>
                            <Trans>Hour</Trans>
                          </option>
                          <option value={3}>
                            <Trans>Day</Trans>
                          </option>
                          <option value={2}>
                            <Trans>Week</Trans>
                          </option>
                          <option value={1}>
                            <Trans>Month</Trans>
                          </option>
                        </Select>
                      </FormControl>
                    )}
                  </Field>
                </HStack>

                <Field name="rrule.byweekday">
                  {({ field }: FieldProps) => {
                    return Number.parseInt(
                      form.getFieldProps("rrule.freq").value
                    ) === frequencies.WEEKLY ? (
                      <CheckboxGroup
                        items={[
                          { title: t`Mo`, value: "1" },
                          { title: t`Tu`, value: "2" },
                          { title: t`We`, value: "3" },
                          { title: t`Th`, value: "4" },
                          { title: t`Fr`, value: "5" },
                          { title: t`Sa`, value: "6" },
                          { title: t`Su`, value: "7" },
                        ]}
                        value={field.value?.map((v: number) => v.toString())}
                        onChange={(value) =>
                          form.setFieldValue(
                            field.name,
                            value.length
                              ? value.map((v) => Number.parseInt(v))
                              : [new Date().getDay()]
                          )
                        }
                      />
                    ) : null;
                  }}
                </Field>

                <VStack alignItems={"start"} pl={8}>
                  <Box mb={2}>
                    <Trans>Repeat finish:</Trans>
                  </Box>
                  <Field name="rrule.until">
                    {({ field, meta }: FieldProps) => {
                      return (
                        <FormControl
                          flex={"20%"}
                          isInvalid={!!(meta.touched && meta.error)}
                        >
                          <RadioGroup
                            {...field}
                            onChange={(value) =>
                              form.setFieldValue(
                                field.name,
                                value === "never" ? undefined : new Date()
                              )
                            }
                            value={
                              field.value === "never" ||
                              field.value == undefined
                                ? "never"
                                : "date"
                            }
                          >
                            <VStack alignItems={"start"}>
                              <Radio value="never">
                                <Trans>Never</Trans>
                              </Radio>
                              <HStack spacing={8} w={"100%"}>
                                <Radio value="date">
                                  <Trans>Date</Trans>
                                </Radio>

                                <div className="react-datepicker__field-wrapper">
                                  <DatePicker
                                    disabled={!field.value}
                                    minDate={new Date()}
                                    showTimeSelect
                                    timeIntervals={1}
                                    dateFormat="Pp"
                                    selected={field.value}
                                    onChange={(d) =>
                                      form.setFieldValue(field.name, d)
                                    }
                                  />
                                </div>
                              </HStack>
                            </VStack>
                          </RadioGroup>
                        </FormControl>
                      );
                    }}
                  </Field>
                </VStack>
              </>
            ) : null}

            <Button
              isLoading={form.isSubmitting}
              borderRadius={0}
              type="submit"
              variant={"submitBtn"}
            >
              <Trans>Save</Trans>
            </Button>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};
