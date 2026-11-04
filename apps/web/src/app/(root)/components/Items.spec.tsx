import { fireEvent, render, screen } from '@testing-library/react';
import { Items } from './Items';
import { ItemAndBasicUserBorrower } from '../../../types/types';

function renderItems(items: ItemAndBasicUserBorrower[], allowCheckInOut = true) {
  const onCheckOut = jest.fn();
  const onReturn = jest.fn();
  render(
    <Items
      items={items}
      allowCheckInOut={allowCheckInOut}
      onCheckOut={onCheckOut}
      onReturn={onReturn}
    />
  );
  return { onCheckOut, onReturn };
}

describe('Items', () => {
  it('shows the name and description of every item', () => {
    renderItems([
      {
        id: 1,
        name: 'HDMI cable',
        description: '6 ft, black',
        status: 'available',
        borrower: null
      },
      { id: 2, name: 'Box of pens', description: 'blue ink', status: 'available', borrower: null }
    ]);

    expect(screen.getByText('HDMI cable')).toBeTruthy();
    expect(screen.getByText('6 ft, black')).toBeTruthy();
    expect(screen.getByText('Box of pens')).toBeTruthy();
    expect(screen.getByText('blue ink')).toBeTruthy();
  });

  it('shows an item that has no description', () => {
    renderItems([{ id: 1, name: 'HDMI cable', description: null, status: 'available', borrower: null }]);

    expect(screen.getByText('HDMI cable')).toBeTruthy();
  });

  it('shows a check out button only for available items', () => {
    renderItems([{ id: 1, name: 'HDMI cable', description: null, status: 'available', borrower: null }]);

    expect(screen.getByText('Check out')).toBeTruthy();
    expect(screen.queryByText('Return')).toBeNull();
  });

  it('shows a return button only for booked items', () => {
    renderItems([{ id: 1, name: 'HDMI cable', description: null, status: 'booked', borrower: 7 }]);

    expect(screen.getByText('Return')).toBeTruthy();
    expect(screen.queryByText('Check out')).toBeNull();
  });

  it('shows no buttons for out of service items', () => {
    renderItems([{ id: 1, name: 'HDMI cable', description: null, status: 'out_of_service', borrower: null }]);

    expect(screen.getByText('Out of service')).toBeTruthy();
    expect(screen.queryByText('Check out')).toBeNull();
    expect(screen.queryByText('Return')).toBeNull();
  });

  it('shows no buttons for an item that is still being saved', () => {
    renderItems([{ id: -1, name: 'HDMI cable', description: null, status: 'available', borrower: null }]);

    expect(screen.queryByText('Check out')).toBeNull();
    expect(screen.queryByText('Return')).toBeNull();
  });

  it('shows no buttons when check in/out is not allowed', () => {
    renderItems(
      [
        { id: 1, name: 'HDMI cable', description: null, status: 'available', borrower: null },
        { id: 2, name: 'Box of pens', description: null, status: 'booked', borrower: 7 }
      ],
      false
    );

    expect(screen.queryByText('Check out')).toBeNull();
    expect(screen.queryByText('Return')).toBeNull();
  });

  it('calls onCheckOut with the item id when check out is clicked', () => {
    const { onCheckOut, onReturn } = renderItems([
      { id: 3, name: 'HDMI cable', description: null, status: 'available', borrower: null }
    ]);

    fireEvent.click(screen.getByText('Check out'));

    expect(onCheckOut).toHaveBeenCalledWith(3);
    expect(onReturn).not.toHaveBeenCalled();
  });

  it('calls onReturn with the item id when return is clicked', () => {
    const { onCheckOut, onReturn } = renderItems([
      { id: 5, name: 'HDMI cable', description: null, status: 'booked', borrower: 7 }
    ]);

    fireEvent.click(screen.getByText('Return'));

    expect(onReturn).toHaveBeenCalledWith(5);
    expect(onCheckOut).not.toHaveBeenCalled();
  });
});
