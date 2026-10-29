import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { Field, FieldError } from './ui/field';
import { Input } from './ui/input';
import { Button } from './ui/button';

type NewAdminFormProps = {
  externalValidator?: (email: string) => Promise<true | { msg: string }>;
  onCancel: () => void;
  onSubmit: (email: string) => void;
};

export function NewAdminForm({ externalValidator, onCancel, onSubmit }: NewAdminFormProps) {
  const form = useForm({
    validators: {
      onChange: z.object({
        email: z.email()
      }),
      onSubmitAsync: async ({ value }) => {
        const validatorRes = await externalValidator?.(value.email);
        if (validatorRes === undefined) return undefined;
        if (validatorRes === true) return undefined;
        return validatorRes.msg;
      }
    },
    defaultValues: {
      email: ''
    },
    onSubmit: ({ value }) => {
      onSubmit(value.email);
    }
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <form.Field name="email">
        {(field) => (
          <div className="w-full">
            <Field>
              <Input
                placeholder="Email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.isTouched && <FieldError errors={field.state.meta.errors} />}
            </Field>
          </div>
        )}
      </form.Field>

      <div className="flex gap-4 w-full justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>

        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
