# Cover Guessr

```sql
INSERT INTO albums (album, cover, year, artist_id)
VALUES ("Crying Over Pros for No Reason", "https://res.cloudinary.com/brother-sailor/image/upload/v1687741587/albums/edit_criying-over-pros-for-no-reason_brdiuf.webp", 2004, 0, 4)
`
```

user_id = auth.uid()

begin
insert into public.users (id, name, user_name, avatar_url)
values (
new.id,
new.raw_user_meta_data->>'name',
new.raw_user_meta_data->>'user_name',
new.raw_user_meta_data->>'avatar_url'
);
return new;
end
