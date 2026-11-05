import type * as prismic from "@prismicio/client";

type Simplify<T> = { [KeyType in keyof T]: T[KeyType] };


type PickContentRelationshipFieldData<
	TRelationship extends prismic.CustomTypeModelFetchCustomTypeLevel1 | prismic.CustomTypeModelFetchCustomTypeLevel2 | prismic.CustomTypeModelFetchGroupLevel1 | prismic.CustomTypeModelFetchGroupLevel2,
	TData extends Record<string, prismic.AnyRegularField | prismic.GroupField | prismic.NestedGroupField | prismic.SliceZone>,
	TLang extends string
> = |
	// Content relationship fields
	{
		[TSubRelationship in Extract<
			TRelationship["fields"][number], prismic.CustomTypeModelFetchContentRelationshipLevel1
		> as TSubRelationship["id"]]:
			ContentRelationshipFieldWithData<TSubRelationship["customtypes"], TLang>;
	} &
	// Group
	{
		[TGroup in Extract<
			TRelationship["fields"][number], prismic.CustomTypeModelFetchGroupLevel1 | prismic.CustomTypeModelFetchGroupLevel2
		> as TGroup["id"]]:
			TData[TGroup["id"]] extends prismic.GroupField<infer TGroupData>
				? prismic.GroupField<PickContentRelationshipFieldData<TGroup, TGroupData, TLang>>
				: never
	} &
	// Other fields
	{
		[TFieldKey in Extract<TRelationship["fields"][number], string>]:
			TFieldKey extends keyof TData ? TData[TFieldKey] : never;
	};

type ContentRelationshipFieldWithData<
	TCustomType extends readonly (prismic.CustomTypeModelFetchCustomTypeLevel1 | string)[] | readonly (prismic.CustomTypeModelFetchCustomTypeLevel2 | string)[],
	TLang extends string = string
> = {
	[ID in Exclude<TCustomType[number], string>["id"]]:
		prismic.ContentRelationshipField<
			ID,
			TLang,
			PickContentRelationshipFieldData<
				Extract<TCustomType[number], { id: ID }>,
				Extract<prismic.Content.AllDocumentTypes, { type: ID }>["data"],
				TLang
			>
		>
}[Exclude<TCustomType[number], string>["id"]];

/**
 * Item in *form replies → replies*
 */
export interface FormRepliesDocumentDataRepliesItem {
	/**
	 * form field in *form replies → replies*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: Pick the form this reply answers — one row per form
	 * - **API ID Path**: form_replies.replies[].form_type
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	form_type: prismic.SelectField<"contact" | "inquiry" | "newsletter" | "rsvp" | "reserve">;
	
	/**
	 * subject field in *form replies → replies*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Subject line of the email the visitor receives
	 * - **API ID Path**: form_replies.replies[].subject
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	subject: prismic.KeyTextField;
	
	/**
	 * body field in *form replies → replies*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: What the visitor reads. Bold, italic, links and lists are sent; other formatting is not.
	 * - **API ID Path**: form_replies.replies[].body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
}

/**
 * Content for form replies documents
 */
interface FormRepliesDocumentData {
	/**
	 * replies field in *form replies*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: form_replies.replies[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	replies: prismic.GroupField<Simplify<FormRepliesDocumentDataRepliesItem>>;
	
	/**
	 * signature field in *form replies*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Sign-off appended to every reply, whatever the form
	 * - **API ID Path**: form_replies.signature
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	signature: prismic.RichTextField;
}

/**
 * form replies document from Prismic
 *
 * - **API ID**: `form_replies`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type FormRepliesDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<FormRepliesDocumentData>, "form_replies", Lang>;

/**
 * Content for Home page documents
 */
interface HomePageDocumentData {
	/**
	 * heading field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Your Trusted Partner
	 * - **API ID Path**: home_page.trusted_heading
	 * - **Tab**: Your Trusted Partner
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	trusted_heading: prismic.KeyTextField;
	
	/**
	 * VOSB logo: description for screen readers field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Veteran-Owned Small Business (VOSB)
	 * - **API ID Path**: home_page.vosb_logo_alt
	 * - **Tab**: Your Trusted Partner
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	vosb_logo_alt: prismic.KeyTextField;
	
	/**
	 * paragraph under the definition field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Our expertise, VOSB (Veteran-Owned Small Business) status, and deep network of relation…
	 * - **API ID Path**: home_page.trusted_text
	 * - **Tab**: Your Trusted Partner
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	trusted_text: prismic.KeyTextField;
	
	/**
	 * first button field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Contact Us
	 * - **API ID Path**: home_page.contact_button
	 * - **Tab**: Your Trusted Partner
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	contact_button: prismic.KeyTextField;
	
	/**
	 * second button field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Capabilities Statement
	 * - **API ID Path**: home_page.capabilities_button
	 * - **Tab**: Your Trusted Partner
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	capabilities_button: prismic.KeyTextField;/**
	 * video: description for screen readers field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: background video
	 * - **API ID Path**: home_page.video_title
	 * - **Tab**: We'll Get You
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	video_title: prismic.KeyTextField;
	
	/**
	 * heading over the video field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: We'll Get You
	 * - **API ID Path**: home_page.we_get_heading
	 * - **Tab**: We'll Get You
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	we_get_heading: prismic.KeyTextField;
	
	/**
	 * first rotating line (Shift+Enter breaks the line) field in *Home page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Leave empty to keep: Priority / Access
	 * - **API ID Path**: home_page.we_get_1
	 * - **Tab**: We'll Get You
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	we_get_1: prismic.RichTextField;
	
	/**
	 * second rotating line (Shift+Enter breaks the line) field in *Home page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Leave empty to keep: contract / expertise
	 * - **API ID Path**: home_page.we_get_2
	 * - **Tab**: We'll Get You
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	we_get_2: prismic.RichTextField;
	
	/**
	 * third rotating line (Shift+Enter breaks the line) field in *Home page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Leave empty to keep: Direct / Results
	 * - **API ID Path**: home_page.we_get_3
	 * - **Tab**: We'll Get You
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	we_get_3: prismic.RichTextField;
	
	/**
	 * subheading field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: The Clinician in Mind
	 * - **API ID Path**: home_page.clinician_heading
	 * - **Tab**: We'll Get You
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	clinician_heading: prismic.KeyTextField;
	
	/**
	 * paragraph field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: MSOT makes medical care possible from the war fighter all the way to the retiree and al…
	 * - **API ID Path**: home_page.clinician_text
	 * - **Tab**: We'll Get You
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	clinician_text: prismic.KeyTextField;/**
	 * first timeline image: description for screen readers field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: A timeline of the six stages of a service member's life: start date at 18, deployment o…
	 * - **API ID Path**: home_page.timeline_1_alt
	 * - **Tab**: Timelines
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	timeline_1_alt: prismic.KeyTextField;
	
	/**
	 * second timeline image: description for screen readers field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: A timeline of the six stages of a service member's life: start date at 18, deployment o…
	 * - **API ID Path**: home_page.timeline_2_alt
	 * - **Tab**: Timelines
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	timeline_2_alt: prismic.KeyTextField;
	
	/**
	 * third timeline image: description for screen readers field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: A timeline of the six stages of a service member's life: start date at 18, deployment o…
	 * - **API ID Path**: home_page.timeline_3_alt
	 * - **Tab**: Timelines
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	timeline_3_alt: prismic.KeyTextField;/**
	 * heading field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: We Know What to Do
	 * - **API ID Path**: home_page.know_heading
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	know_heading: prismic.KeyTextField;
	
	/**
	 * left column heading field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Government Contracts Are
	 * - **API ID Path**: home_page.problem_heading
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	problem_heading: prismic.KeyTextField;
	
	/**
	 * left column, first word field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: opaque
	 * - **API ID Path**: home_page.problem_1
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	problem_1: prismic.KeyTextField;
	
	/**
	 * left column, second word field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: confusing
	 * - **API ID Path**: home_page.problem_2
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	problem_2: prismic.KeyTextField;
	
	/**
	 * left column, third word field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: inaccessible
	 * - **API ID Path**: home_page.problem_3
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	problem_3: prismic.KeyTextField;
	
	/**
	 * right column heading field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: What You’ll get With MSOT
	 * - **API ID Path**: home_page.answer_heading
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	answer_heading: prismic.KeyTextField;
	
	/**
	 * right column, first word field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: transparency
	 * - **API ID Path**: home_page.answer_1
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	answer_1: prismic.KeyTextField;
	
	/**
	 * right column, second word field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: understanding
	 * - **API ID Path**: home_page.answer_2
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	answer_2: prismic.KeyTextField;
	
	/**
	 * right column, third word field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: access
	 * - **API ID Path**: home_page.answer_3
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	answer_3: prismic.KeyTextField;
	
	/**
	 * heading below field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: We’re here to help
	 * - **API ID Path**: home_page.help_heading
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	help_heading: prismic.KeyTextField;
	
	/**
	 * line under it field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Take the headache and confusion out of dealing with government healthcare
	 * - **API ID Path**: home_page.help_text
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	help_text: prismic.KeyTextField;/**
	 * heading field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Our Partner
	 * - **API ID Path**: home_page.partner_heading
	 * - **Tab**: Our Partner
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	partner_heading: prismic.KeyTextField;
	
	/**
	 * quote, with its quotation marks field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: “MSOT made the process of getting our product into the DoD system easier than we ever t…
	 * - **API ID Path**: home_page.partner_quote
	 * - **Tab**: Our Partner
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	partner_quote: prismic.KeyTextField;
	
	/**
	 * partner logo: the partner's name field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Revogen
	 * - **API ID Path**: home_page.partner_logo_alt
	 * - **Tab**: Our Partner
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	partner_logo_alt: prismic.KeyTextField;/**
	 * heading, first line field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Getting started
	 * - **API ID Path**: home_page.start_heading_1
	 * - **Tab**: Getting Started
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	start_heading_1: prismic.KeyTextField;
	
	/**
	 * heading, second line field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: is simple with msot
	 * - **API ID Path**: home_page.start_heading_2
	 * - **Tab**: Getting Started
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	start_heading_2: prismic.KeyTextField;
	
	/**
	 * step 01 (Shift+Enter breaks the line) field in *Home page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Leave empty to keep: establish / goals
	 * - **API ID Path**: home_page.step_1
	 * - **Tab**: Getting Started
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	step_1: prismic.RichTextField;
	
	/**
	 * step 02 (Shift+Enter breaks the line) field in *Home page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Leave empty to keep: Find Your / access points
	 * - **API ID Path**: home_page.step_2
	 * - **Tab**: Getting Started
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	step_2: prismic.RichTextField;
	
	/**
	 * step 03 (Shift+Enter breaks the line) field in *Home page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Leave empty to keep: Set pricing / direct invoicing
	 * - **API ID Path**: home_page.step_3
	 * - **Tab**: Getting Started
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	step_3: prismic.RichTextField;
	
	/**
	 * button field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Learn More
	 * - **API ID Path**: home_page.start_button
	 * - **Tab**: Getting Started
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	start_button: prismic.KeyTextField;/**
	 * large line over the photo field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: let’s get started
	 * - **API ID Path**: home_page.cta_line
	 * - **Tab**: Let's Get Started
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	cta_line: prismic.KeyTextField;
	
	/**
	 * first button field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Contact Us
	 * - **API ID Path**: home_page.cta_contact_button
	 * - **Tab**: Let's Get Started
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	cta_contact_button: prismic.KeyTextField;
	
	/**
	 * second button field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Learn More
	 * - **API ID Path**: home_page.cta_process_button
	 * - **Tab**: Let's Get Started
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	cta_process_button: prismic.KeyTextField;
}

/**
 * Home page document from Prismic
 *
 * - **API ID**: `home_page`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type HomePageDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<HomePageDocumentData>, "home_page", Lang>;

type PageDocumentDataSlicesSlice = RichTextSlice

/**
 * Content for Page documents
 */
interface PageDocumentData {
	/**
	 * Title field in *Page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: page.title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Slice Zone field in *Page*
	 *
	 * - **Field Type**: Slice Zone
	 * - **Placeholder**: *None*
	 * - **API ID Path**: page.slices[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/slices
	 */
	slices: prismic.SliceZone<PageDocumentDataSlicesSlice>;/**
	 * Meta Title field in *Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A title of the page used for social media and search engines
	 * - **API ID Path**: page.meta_title
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_title: prismic.KeyTextField;
	
	/**
	 * Meta Description field in *Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A brief summary of the page
	 * - **API ID Path**: page.meta_description
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_description: prismic.KeyTextField;
	
	/**
	 * Meta Image field in *Page*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: page.meta_image
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	meta_image: prismic.ImageField<never>;
}

/**
 * Page document from Prismic
 *
 * - **API ID**: `page`
 * - **Repeatable**: `true`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type PageDocument<Lang extends string = string> = prismic.PrismicDocumentWithUID<Simplify<PageDocumentData>, "page", Lang>;

/**
 * Content for Team member documents
 */
interface TeamMemberDocumentData {
	/**
	 * name field in *Team member*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Full name, as on the site (e.g. Jon Hood)
	 * - **API ID Path**: team_member.name
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	name: prismic.KeyTextField;
	
	/**
	 * job title field in *Team member*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Title, as on the site (e.g. CEO)
	 * - **API ID Path**: team_member.job_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	job_title: prismic.KeyTextField;
	
	/**
	 * headshot field in *Team member*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: team_member.headshot
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	headshot: prismic.ImageField<never>;
	
	/**
	 * bio field in *Team member*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: 50–90 words, third person. Say VOSB (never SDVOSB), clinicians, and VA and DoW.
	 * - **API ID Path**: team_member.bio
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	bio: prismic.RichTextField;
	
	/**
	 * LinkedIn field in *Team member*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: Optional: the person's LinkedIn profile URL
	 * - **API ID Path**: team_member.linkedin
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	linkedin: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * order field in *Team member*
	 *
	 * - **Field Type**: Number
	 * - **Placeholder**: Position on the About page: 1 is first
	 * - **API ID Path**: team_member.order
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/number
	 */
	order: prismic.NumberField;
}

/**
 * Team member document from Prismic
 *
 * - **API ID**: `team_member`
 * - **Repeatable**: `true`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type TeamMemberDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<TeamMemberDocumentData>, "team_member", Lang>;

export type AllDocumentTypes = FormRepliesDocument | HomePageDocument | PageDocument | TeamMemberDocument;

/**
 * Primary content in *RichText → Default → Primary*
 */
export interface RichTextSliceDefaultPrimary {
	/**
	 * Content field in *RichText → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Lorem ipsum...
	 * - **API ID Path**: rich_text.default.primary.content
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	content: prismic.RichTextField;
}

/**
 * Default variation for RichText Slice
 *
 * - **API ID**: `default`
 * - **Description**: RichText
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type RichTextSliceDefault = prismic.SharedSliceVariation<"default", Simplify<RichTextSliceDefaultPrimary>, never>;

/**
 * Slice variation for *RichText*
 */
type RichTextSliceVariation = RichTextSliceDefault

/**
 * RichText Shared Slice
 *
 * - **API ID**: `rich_text`
 * - **Description**: RichText
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type RichTextSlice = prismic.SharedSlice<"rich_text", RichTextSliceVariation>;

declare module "@prismicio/client" {
	interface CreateClient {
		(repositoryNameOrEndpoint: string, options?: prismic.ClientConfig): prismic.Client<AllDocumentTypes>;
	}
	
	interface CreateWriteClient {
		(repositoryNameOrEndpoint: string, options: prismic.WriteClientConfig): prismic.WriteClient<AllDocumentTypes>;
	}
	
	interface CreateMigration {
		(): prismic.Migration<AllDocumentTypes>;
	}
	
	namespace Content {
		export type {
			FormRepliesDocument,
			FormRepliesDocumentData,
			FormRepliesDocumentDataRepliesItem,
			HomePageDocument,
			HomePageDocumentData,
			PageDocument,
			PageDocumentData,
			PageDocumentDataSlicesSlice,
			TeamMemberDocument,
			TeamMemberDocumentData,
			AllDocumentTypes,
			RichTextSlice,
			RichTextSliceDefaultPrimary,
			RichTextSliceVariation,
			RichTextSliceDefault
		}
	}
}