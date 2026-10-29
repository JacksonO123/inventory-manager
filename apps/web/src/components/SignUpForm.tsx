import { useForm } from '@tanstack/react-form';
import { BasicUser, PartialBasicUser } from '../types/types';
import { z } from 'zod';
import { Field, FieldError, FieldLabel } from './ui/field';
import { useId, useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useBasicAuth } from '../hooks/useBasicAuth';
import { tsr } from '../server/tsr';
import { toast } from './ui/toast';
import { useAuthPopup } from '../hooks/useAuthPopup';

type SignUpFormContentsProps = {
  showUserExistsHint?: boolean;

  onSubmit: (user: PartialBasicUser) => void;
  onClose: () => void;
};

export function SignUpFormContents({
  onSubmit,
  onClose,
  showUserExistsHint
}: SignUpFormContentsProps) {
  const { switchAuthType } = useAuthPopup();

  const form = useForm({
    validators: {
      onChange: z.object({
        name: z.string().trim().min(1),
        email: z.email()
      })
    },
    defaultValues: {
      name: '',
      email: ''
    },
    onSubmit: ({ value }) => {
      onSubmit({ name: value.name.trim(), email: value.email.trim() });
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
      <form.Field name="name">
        {(field) => (
          <div className="w-full">
            <Field>
              <FieldLabel htmlFor={`entry-name-${formId}`}>Name</FieldLabel>
              <Input
                id={`entry-name-${formId}`}
                placeholder="Name"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.isTouched && <FieldError errors={field.state.meta.errors} />}
            </Field>
          </div>
        )}
      </form.Field>
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
        <Button variant="outline" onClick={onClose}>
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
      {showUserExistsHint === true && (
        <span className="mx-auto">
          Email already exists, try{' '}
          <button
            className="text-primary underline cursor-pointer"
            onClick={() => switchAuthType('login')}
          >
            logging in
          </button>
        </span>
      )}
    </form>
  );
}

type SignUpFormHandlerProps = {
  onClose: () => void;
};

export function SignUpFormHandler({ onClose }: SignUpFormHandlerProps) {
  const { setBasicUser } = useBasicAuth();
  const [showExistsHint, setShowExistsHint] = useState(false);

  async function createUser(user: PartialBasicUser) {
    const res = await tsr.auth.createUser.mutate({
      body: user
    });
    if (res.status === 200) {
      const fullUser: BasicUser = { ...user, id: res.body.id };
      setBasicUser(fullUser);
      onClose();
    }
  }

  async function onSubmit(user: PartialBasicUser) {
    const logInAttempt = await tsr.auth.getUser.query({ query: { email: user.email } });
    if (logInAttempt.status === 200) {
      const resUser = logInAttempt.body.user;
      if (resUser !== null) {
        setShowExistsHint(true);
      } else {
        await createUser(user);
      }
    } else if (logInAttempt.status === 500) {
      toast.add({
        type: 'error',
        title: logInAttempt.body.message
      });
    }
  }

  return (
    <SignUpFormContents onSubmit={onSubmit} onClose={onClose} showUserExistsHint={showExistsHint} />
  );
}
