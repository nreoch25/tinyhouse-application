import { Button, Card, Divider, Typography, DatePicker } from "antd";
import moment, { Moment } from "moment";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Viewer } from "../../../../lib/types";
import { formatListingPrice, displayErrorMessage } from "../../../../lib/utils";
import { Listing as ListingData } from "../../../../lib/graphql/queries/Listing/__generated__/Listing";
import { BookingsIndex } from "./types";

const { Paragraph, Title, Text } = Typography;

interface Props {
  price: number;
  checkInDate: Moment | null;
  checkOutDate: Moment | null;
  setCheckInDate: (checkInDate: Moment | null) => void;
  setCheckOutDate: (checkOutDate: Moment | null) => void;
  viewer: Viewer;
  host: ListingData["listing"]["host"];
  bookingsIndex: ListingData["listing"]["bookingsIndex"];
  setModalVisible: (modalVisible: boolean) => void;
}

const CreateBooking = ({
  price,
  checkInDate,
  checkOutDate,
  setCheckInDate,
  setCheckOutDate,
  viewer,
  host,
  bookingsIndex,
  setModalVisible,
}: Props) => {
  const bookingsIndexJSON: BookingsIndex = JSON.parse(bookingsIndex);

  const dateIsBooked = (currentDate: Moment) => {
    const year = moment(currentDate).year();
    const month = moment(currentDate).month();
    const day = moment(currentDate).date();

    if (bookingsIndexJSON[year] && bookingsIndexJSON[year][month]) {
      return Boolean(bookingsIndexJSON[year][month][day]);
    } else {
      return false;
    }
  };

  const disabledDate = (currentDate: any) => {
    if (currentDate) {
      const dateIsBeforeEndOfDay = currentDate.isBefore(moment().endOf("day"));
      return dateIsBeforeEndOfDay || dateIsBooked(currentDate);
    }
    return true;
  };

  const verifyAndSetCheckOutDate = (selectedCheckOutDate: Moment | null) => {
    if (checkInDate && selectedCheckOutDate) {
      if (moment(selectedCheckOutDate).isBefore(checkInDate, "days")) {
        return displayErrorMessage(`You can't book date of check out to be prior to check in!`);
      }
    }

    let dateCursor = checkInDate;

    while (moment(dateCursor).isBefore(selectedCheckOutDate, "days")) {
      dateCursor = moment(dateCursor).add(1, "days");

      const year = moment(dateCursor).year();
      const month = moment(dateCursor).month();
      const day = moment(dateCursor).date();

      if (
        bookingsIndexJSON[year] &&
        bookingsIndexJSON[year][month] &&
        bookingsIndexJSON[year][month][day]
      ) {
        return displayErrorMessage(
          "You can't book a period of time that overlaps existing bookings. Please try again!"
        );
      }
    }

    setCheckOutDate(selectedCheckOutDate);
  };

  const viewerIsHost = viewer.id === host.id;
  const checkInInputDisabled = !viewer.id || viewerIsHost || !host.hasWallet;
  const checkOutInputDisabled = checkInInputDisabled || !checkInDate;
  const buttonDisabled = checkOutInputDisabled || !checkInDate || !checkOutDate;

  let buttonMessage = "You won't be charged yet";
  if (!viewer.id) {
    buttonMessage = "You have to be signed in to book a listing!";
  } else if (viewerIsHost) {
    buttonMessage = "You can't book your own listing!";
  } else if (!host.hasWallet) {
    buttonMessage =
      "The host has disconnected from Stripe and thus won't be able to receive payments.";
  }

  return (
    <div className="listing-booking">
      <Card className="listing-booking__card">
        <div>
          <Paragraph>
            <Title level={2} className="listing-booking__card-title">
              {formatListingPrice(price)}
              <span>/day</span>
            </Title>
          </Paragraph>
          <Divider />
          <div className="listing-booking__card-date-picker">
            <Paragraph strong>Check In</Paragraph>
            <DatePicker
              disabledDate={disabledDate}
              value={checkInDate}
              format={"YYYY/MM/DD"}
              onChange={(dateValue) => setCheckInDate(dateValue as Moment)}
              onOpenChange={() => setCheckOutDate(null)}
              showToday={false}
              disabled={checkInInputDisabled}
            />
          </div>
          <div className="listing-booking__card-date-picker">
            <Paragraph strong>Check Out</Paragraph>
            <DatePicker
              disabledDate={disabledDate}
              value={checkOutDate}
              format={"YYYY/MM/DD"}
              onChange={(dateValue) => verifyAndSetCheckOutDate(dateValue as Moment)}
              showToday={false}
              disabled={checkOutInputDisabled}
            />
          </div>
        </div>
        <Divider />
        <Button
          size="large"
          type="primary"
          className="listing-booking__card-cta"
          disabled={buttonDisabled}
          onClick={() => setModalVisible(true)}
        >
          Request to book!
        </Button>
        <Text type="secondary" mark>
          {buttonMessage}
        </Text>
      </Card>
    </div>
  );
};

export { CreateBooking };
