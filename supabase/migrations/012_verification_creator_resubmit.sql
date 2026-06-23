-- Allow creators to re-submit a rejected verification request
create policy "creator_update_own_rejected_request"
  on public.verification_requests for update
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
    and status = 'rejected'
  )
  with check (
    profile_id in (select id from public.profiles where user_id = auth.uid())
    and status = 'pending'
  );
