import { Loader2 } from "lucide-react";

const Loader: React.FC = () => {
	return (
		<div>
			<Loader2 className="animate-spin size-16" />
			{/* <Card className="min-h-[300px] w-full max-w-xl mx-auto p-6 flex flex-col items-center justify-center bg-muted dark:bg-muted/40">
                <CardContent className="text-center">
                    <blockquote className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
                        “{quote.content}”
                    </blockquote>
                </CardContent>
                <p className="text-lg text-muted-foreground">— {quote.author}</p>
                <CardFooter>
                    <Loader color="red" className="animate-spin" />
                </CardFooter>

            </Card> */}
		</div>
	);
};

export default Loader;
