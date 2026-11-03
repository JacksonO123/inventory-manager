import { orgSchema } from '@invm/api-contracts/schemas';
import { useForm } from '@tanstack/react-form';
import { PartialOrg } from '../../../types/types';
import { Field, FieldError, FieldLabel } from '../../../components/ui/field';
import { Input } from '../../../components/ui/input';
import { useId } from 'react';
import { Textarea } from '../../../components/ui/textarea';
import { Button } from '../../../components/ui/button';

type CreateOrgFormProps = {
  onSubmit: (org: PartialOrg) => void;
  onCancel: () => void;
};

export function CreateOrgForm({ onSubmit, onCancel }: CreateOrgFormProps) {
  const formId = useId();

  const form = useForm({
    validators: {
      onChange: orgSchema
        .omit({ id: true })
        .extend({ svgDataUrl: orgSchema.shape.svgDataUrl.unwrap() })
    },
    defaultValues: {
      name: '',
      description: '',
      path: '',
      svgDataUrl: ''
    },
    onSubmit: ({ value }) => {
      const obj: PartialOrg = {
        name: value.name.trim(),
        description: value.description.trim(),
        path: value.path.trim(),
        svgDataUrl: value.svgDataUrl.trim() || null
      };
      onSubmit(obj);
    }
  });

  function calculateDefaultPath() {
    return form.state.values.name
      .toLowerCase()
      .split(' ')
      .filter((item) => item.length > 0)
      .join('-');
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field name="name">
        {(field) => (
          <div className="w-full">
            <Field>
              <FieldLabel htmlFor={`org-name-${formId}`}>Name</FieldLabel>
              <Input
                id={`org-name-${formId}`}
                placeholder="Name"
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
              <FieldLabel htmlFor={`org-description-${formId}`}>Description</FieldLabel>
              <Textarea
                id={`org-description-${formId}`}
                placeholder="Description"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.isTouched && <FieldError errors={field.state.meta.errors} />}
            </Field>
          </div>
        )}
      </form.Field>
      <form.Field name="path">
        {(field) => (
          <div className="w-full">
            <Field>
              <FieldLabel htmlFor={`org-path-${formId}`}>Path (optional)</FieldLabel>
              <Input
                id={`org-path-${formId}`}
                placeholder={calculateDefaultPath()}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.isTouched && <FieldError errors={field.state.meta.errors} />}
            </Field>
          </div>
        )}
      </form.Field>
      <form.Field name="svgDataUrl">
        {(field) => (
          <div className="w-full">
            <Field>
              <FieldLabel htmlFor={`org-svg-url-${formId}`}>Svg data url (optional)</FieldLabel>
              <Input
                id={`org-svg-url-${formId}`}
                placeholder="Svg data url"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.isTouched && <FieldError errors={field.state.meta.errors} />}
            </Field>
          </div>
        )}
      </form.Field>
      <div className="flex gap-4 justify-end">
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
