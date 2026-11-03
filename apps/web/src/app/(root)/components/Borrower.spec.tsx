import { fireEvent, render, screen } from '@testing-library/react';
import { Borrower } from './Borrower';

describe('Borrower', () => {
  it('asks to select a borrower when none is set', () => {
    render(<Borrower borrower={null} onChange={jest.fn()} />);

    expect(screen.getByText('No borrower selected')).toBeTruthy();
    expect(screen.getByText('Select borrower')).toBeTruthy();
  });

  it('shows the current borrower and offers to change them', () => {
    render(
      <Borrower
        borrower={{ id: 1, name: 'Jane Doe', email: 'jane@example.com' }}
        onChange={jest.fn()}
      />
    );

    expect(screen.getByText('Jane Doe')).toBeTruthy();
    expect(screen.getByText('(jane@example.com)', { exact: false })).toBeTruthy();
    expect(screen.getByText('Change borrower')).toBeTruthy();
  });

  it('calls onChange when the button is clicked', () => {
    const onChange = jest.fn();
    render(<Borrower borrower={null} onChange={onChange} />);

    fireEvent.click(screen.getByText('Select borrower'));

    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
