import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { Field, FieldError, FieldLabel } from './ui/field';
import { useId, useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useBasicAuth } from '../hooks/useBasicAuth';
import { tsr } from '../server/tsr';
import { toast } from './ui/toast';
import { useAuthPopup } from '../hooks/useAuthPopup';

type LogInFormContentsProps = {
  showUserNotExistHint?: boolean;

  onSubmit: (email: string) => void;
  onCancel: () => void;
};

export function LogInFormContents({
  onSubmit,
  onCancel,
  showUserNotExistHint
}: LogInFormContentsProps) {
  const { switchAuthType } = useAuthPopup();

  const form = useForm({
    validators: {
      onChange: z.object({
        email: z.email()
      })
    },
    defaultValues: {
      email: ''
    },
    onSubmit: ({ value }) => {
      onSubmit(value.email.trim());
    }
  });

  const formId = useId();

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
              <FieldLabel htmlFor={`entry-email-${formId}`}>Email</FieldLabel>
              <Input
                id={`entry-email-${formId}`}
                placeholder="Email"
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
      {showUserNotExistHint === true && (
        <span className="mx-auto">
          Email not found, try{' '}
          <button
            className="text-primary underline cursor-pointer"
            onClick={() => switchAuthType('signup')}
          >
            creating one
          </button>
        </span>
      )}
    </form>
  );
}

type LogInFormHandlerProps = {
  onClose: () => void;
};

export function LogInFormHandler({ onClose }: LogInFormHandlerProps) {
  const { setBasicUser } = useBasicAuth();
  const [showNotExistHint, setShowNotExistHint] = useState(false);

  async function onSubmit(email: string) {
    const res = await tsr.auth.getUser.query({
      query: { email }
    });
    if (res.status === 200) {
      const user = res.body.user;
      if (user !== null) {
        setBasicUser(user);
        onClose();
      } else {
        setShowNotExistHint(true);
      }
    } else if (res.status === 500) {
      toast.add({
        type: 'error',
        title: res.body.message
      });
    }
  }

  return (
    <LogInFormContents
      onSubmit={onSubmit}
      onCancel={onClose}
      showUserNotExistHint={showNotExistHint}
    />
  );
}
