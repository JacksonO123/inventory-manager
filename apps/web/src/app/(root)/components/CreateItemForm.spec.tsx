import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CreateItemForm } from './CreateItemForm';

describe('CreateItemForm', () => {
  it('saves an empty description as null', async () => {
    const onSave = jest.fn();
    render(<CreateItemForm onSave={onSave} onCancel={jest.fn()} />);

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'HDMI cable' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({ name: 'HDMI cable', description: null })
    );
  });
  it('does not save a name that is only whitespace', async () => {
    const onSave = jest.fn();
    render(<CreateItemForm onSave={onSave} onCancel={jest.fn()} />);

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: '   ' } });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await waitFor(() => expect(saveButton).toHaveProperty('disabled', true));

    fireEvent.click(saveButton);
    expect(onSave).not.toHaveBeenCalled();
  });
});
