import "rc-time-picker/assets/index.css";
import React from "react";
import moment, { Moment } from "moment";
import TimePicker from "rc-time-picker";
import "../src/css/custom.css";

interface TimeRangePickerProps {
  value?: Moment;
  minuteStep?: number;
  disabledHours?: number[];
  onChange?: (timeRange: string) => void; // Permite comunicar a mudança ao componente pai
}

interface TimeRangePickerState {
  value1: Moment;
  value2: Moment;
}

export default class TimeRangePicker extends React.Component<
  TimeRangePickerProps,
  TimeRangePickerState
> {
  static defaultProps = {
    disabledHours: [0, 1, 2, 3, 4, 5, 6, 7, 17, 18, 19, 20, 21, 22, 23],
    minuteStep: 30,
  };

  constructor(props: TimeRangePickerProps) {
    super(props);
    const initialValue1 = props.value
      ? props.value.clone()
      : moment().set("hours", 0).set("minutes", 0); // Valor padrão para 00:00
    const initialValue2 = initialValue1
      .clone()
      .add(props.minuteStep || 30, "minutes");

    this.state = {
      value1: initialValue1,
      value2: initialValue2,
    };
  }

  handleValueChange1 = (value1: Moment | null) => {
    if (value1) {
      this.setState({ value1: value1.clone() }, () => {
        this.notifyChange();
      });
    } else {
      this.setState({ value1: moment().set("hours", 0).set("minutes", 0) }); // Valor padrão
    }
  };

  handleValueChange2 = (value2: Moment | null) => {
    if (value2) {
      this.setState({ value2: value2.clone() }, () => {
        this.notifyChange();
      });
    } else {
      this.setState({ value2: moment().set("hours", 0).set("minutes", 0) }); // Valor padrão
    }
  };

  notifyChange = () => {
    const { value1, value2 } = this.state;
    if (this.props.onChange) {
      this.props.onChange(
        `${value1.format("HH:mm")} - ${value2.format("HH:mm")}`
      );
    }
  };

  render() {
    const { value1, value2 } = this.state;
    return (
      <div className="flex flex-row gap-2">
        <div className="">
          <TimePicker
            value={value1}
            minuteStep={this.props.minuteStep}
            showSecond={false}
            onChange={this.handleValueChange1}
            className="input input-bordered"
          />
        </div>
        <div className="">
          <TimePicker
            value={value2}
            minuteStep={this.props.minuteStep}
            showSecond={false}
            onChange={this.handleValueChange2}
            className="input input-bordered w-full"
          />
        </div>
      </div>
    );
  }
}
