import { useForm } from '@tanstack/react-form';
import { Card, CardContent, CardFooter } from '../../../components/ui/card';
import { Field, FieldLabel, FieldError } from '../../../components/ui/field';
import { Input } from '../../../components/ui/input';
import { useId } from 'react';
import { Textarea } from '../../../components/ui/textarea';
import { Button } from '../../../components/ui/button';
import { PartialItem } from '../../../types/types';
import { z } from 'zod';

type CreateItemFormProps = {
  onSave: (item: PartialItem) => void;
  onCancel: () => void;
};

export function CreateItemForm({ onSave, onCancel }: CreateItemFormProps) {
  const formId = useId();

  const form = useForm({
    validators: {
      onChange: z.object({
        name: z.string().min(1),
        description: z.string()
      })
    },
    defaultValues: {
      name: '',
      description: ''
    },
    onSubmit: ({ value }) => {
      onSave({ name: value.name, description: value.description.trim() || null });
    }
  });

  console.log(form.getAllErrors());

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <Card className="w-92">
        <CardContent className="flex flex-col gap-4">
          <form.Field name="name">
            {(field) => (
              <div className="w-full">
                <Field>
                  <FieldLabel htmlFor={`entry-name-${formId}`}>Name</FieldLabel>
                  <Input
                    id={`entry-name-${formId}`}
                    placeholder="Util name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.isTouched && <FieldError errors={field.state.meta.errors} />}
                </Field>
              </div>
            )}
          </form.Field>
          <form.Field name="description">
            {(field) => (
              <div className="w-full">
                <Field>
                  <FieldLabel htmlFor={`entry-description-${formId}`}>
                    Description (optional)
                  </FieldLabel>
                  <Textarea
                    id={`entry-description-${formId}`}
                    placeholder="Description"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.isTouched && <FieldError errors={field.state.meta.errors} />}
                </Field>
              </div>
            )}
          </form.Field>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
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
        </CardFooter>
      </Card>
    </form>
  );
}
