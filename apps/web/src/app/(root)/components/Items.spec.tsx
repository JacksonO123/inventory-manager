import { render, screen } from '@testing-library/react';
import { Items } from './Items';

describe('Items', () => {
  it('shows the name and description of every item', () => {
    render(
      <Items
        items={[
          { id: 1, name: 'HDMI cable', description: '6 ft, black' },
          { id: 2, name: 'Box of pens', description: 'blue ink' }
        ]}
      />
    );

    expect(screen.getByText('HDMI cable')).toBeTruthy();
    expect(screen.getByText('6 ft, black')).toBeTruthy();
    expect(screen.getByText('Box of pens')).toBeTruthy();
    expect(screen.getByText('blue ink')).toBeTruthy();
  });

  it('shows an item that has no description', () => {
    render(<Items items={[{ id: 1, name: 'HDMI cable', description: null }]} />);

    expect(screen.getByText('HDMI cable')).toBeTruthy();
  });
});
