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
    const d = new Date(value);
    d.setSeconds(0);
    d.setMilliseconds(0);
    return d;
  })
  @IsDate()
  dtstart: Date;

  @IsOptional()
  @Transform(({ value }) => {
    const d = new Date(value);
    d.setSeconds(0);
    d.setMilliseconds(0);
    return d;
  })
  @IsDate()
  until: Date;

  @IsOptional()
  @IsNumber()
  freq: Frequency;

  @IsOptional()
  @IsNumber()
  interval?: number;

  @IsOptional()
  @IsNumber({}, { each: true })
  byweekday?: number[];

  @IsString()
  preset: string;

  get options() {
    const opts: {
      wkst: Weekday;
      until: Date;
      dtstart: Date;
      freq?: Frequency;
      interval: number;
      preset: string;
      byweekday?: number[];
    } = {
      wkst: RRule.MO,
      dtstart: this.dtstart,
      until: this.until ?? (!this.interval && this.dtstart),
      interval: this.interval || 1,
      preset: this.preset,
      freq: this.freq || 5,
    };

    if (this.byweekday) {
      opts.byweekday = this.byweekday;
    }

    return opts;
  }
}

export class UpsertEventDto {
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
