import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Frequency, Options, RRule, Weekday } from "rrule";
import { Transform, Type } from "class-transformer";

class PartialRRuleOptions implements Partial<Options> {
  @IsNotEmpty()
  @Transform(({ value }) => {
    return new Date(value);
  })
  @IsDate()
  dtstart: Date;

  @IsOptional()
  @Transform(({ value }) => {
    return new Date(value);
  })
  @IsDate()
  until: Date;

  @IsOptional()
  freq: Frequency;

  @IsOptional()
  @IsNumber()
  interval;

  get options() {
    const opts: {
      wkst: Weekday;
      count: number;
      until: Date;
      dtstart: Date;
      freq?: Frequency;
    } = {
      wkst: RRule.MO,
      dtstart: this.dtstart,
      until: this.until ?? (!this.interval && this.dtstart),
      count: 10,
    };

    if (this.freq) {
      opts.freq = this.freq;
    }

    return opts;
  }
}

export class UpsertTaskDto {
  @IsOptional()
  @IsString()
  _id: string;

  @IsNotEmpty()
  @IsString()
  workflowId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @Type(() => PartialRRuleOptions)
  @ValidateNested()
  rrule: PartialRRuleOptions;
}